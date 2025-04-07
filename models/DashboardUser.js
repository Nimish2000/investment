import { Schema, model } from "mongoose";

const DashboardUserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export default model("DashboardUser", DashboardUserSchema);
