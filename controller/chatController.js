import Chat from "../schema/chatSchema.js";
import User from "../schema/userSchema.js";

// access chat or create new chat
export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      throw new Error("UserId param not send with request");
    }

    // checking if chat pre exits
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } }, //current(loggedin-user) user _id
        { users: { $elemMatch: { $eq: userId } } }, //other user id
      ],
    })
      .populate("users", "-password") //populating users array in Chat collection with user data expect password
      .populate("latestMessage");
    // Populate will automatically replace the specified path in the document, with document(s) from other collection(s).
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    // check if chat exists
    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      //creating new chat
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      res.status(200).send(FullChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// fetch all chats
export const fetchChat = async (req, res) => {
  try {
    // searching through all chats that the logged-in user is a part of
    let Chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    Chats = await User.populate(Chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).send(Chats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// creating a new group-chat
export const createGroupChat = async (req, res) => {
  try {
    //users is array of users of group
    if (!req.body.users || !req.body.name) {
      throw new Error("Please fill all the fields");
    }

    let users = JSON.parse(req.body.users); //users array in stigify format needs to be parsed in json format
    if (users.length < 2) {
      throw new Error("More then 2 users required to make group-chat");
    }
    users.push(req.user); //pushing loggedin user to users arr (group)

    // creating new group chat in db
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    // populating the created chat to send back to user
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//rename a group chat
export const renameGroupChat = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName: chatName },
      { new: "true" } //adding new:true return the updated document otherwise findOneandUpdate return old document
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat not found!");
    } else {
      res.status(200).json(updatedChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//add a user to gruop
export const addToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } }, //$push for pushing ele in array
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat not found!");
    } else {
      res.status(200).json(updatedChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//remove a user from group
export const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    if (!chatId || !userId) {
      res.status(400);
      throw new Error("user-Id or Chat-Id is missing");
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } }, //$pull for removing ele from an array
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat not found!");
    } else {
      res.status(200).json(updatedChat);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id)
    res.status(200).json({message: "group deleted"}) ;
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
