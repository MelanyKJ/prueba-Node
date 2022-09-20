import { Router } from "express";
import * as Controller from "./controller";

const testRouter = Router();

testRouter.route("/").get(Controller.findAll);
testRouter.route("/").post(Controller.create);
testRouter.route("/login").post(Controller.login);
export default testRouter;
