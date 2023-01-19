import express from "express" ;

import { registerUser ,authUser ,getUsers} from "../controller/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const userRouter = express.Router() ;

userRouter.post("/signup" ,registerUser) ;
userRouter.post("/login" ,authUser) ;
userRouter.get("/all",protect ,getUsers) ;

export default userRouter ;