import { UserPosition } from "./user.types";
import { Injectable } from "@angular/core";
import { Socket } from "ngx-socket-io";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  public initUsers: {};
  constructor(private socket: Socket) {}

  sendUserPosition(position: UserPosition) {
    this.socket.emit("position_changed", position);
  }

  getUsers(): Observable<any> {
    return this.socket.fromEvent("online_users");
  }

  subscribeToUserChanges(): Observable<any> {
    return this.socket.fromEvent("user_changed");
  }

  subscribetoUserLogout(): Observable<any> {
    return this.socket.fromEvent("user_logout");
  }
}
