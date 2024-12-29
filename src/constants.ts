import { RunService } from "@rbxts/services";

export const IS_SERVER = RunService.IsServer();
export const IS_CLIENT = RunService.IsClient();
export const IS_TESTING = RunService.IsStudio() && !RunService.IsRunning();
