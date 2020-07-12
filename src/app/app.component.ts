import { SocketService } from "./core/socket.service";
import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent {
  public dataLoaded: boolean = true;

  constructor(private socketService: SocketService) {}

  public ngOnInit(): void {
    this.socketService.getUsers().subscribe((users) => {
      console.log(users);

      this.dataLoaded = true;
      this.socketService.initUsers = users;
    });
  }
}
