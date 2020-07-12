import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { EngineComponent } from "./engine/engine.component";
import { UiInfobarBottomComponent } from "./ui/ui-infobar-bottom/ui-infobar-bottom.component";
import { UiInfobarTopComponent } from "./ui/ui-infobar-top/ui-infobar-top.component";
import { UiSidebarLeftComponent } from "./ui/ui-sidebar-left/ui-sidebar-left.component";
import { UiSidebarRightComponent } from "./ui/ui-sidebar-right/ui-sidebar-right.component";
import { UiComponent } from "./ui/ui.component";
import { SocketIoModule, SocketIoConfig } from "ngx-socket-io";

const config: SocketIoConfig = { url: "http://35.155.249.185/", options: {} };
@NgModule({
  declarations: [
    AppComponent,
    EngineComponent,
    UiComponent,
    UiInfobarBottomComponent,
    UiInfobarTopComponent,
    UiSidebarLeftComponent,
    UiSidebarRightComponent,
  ],
  imports: [BrowserModule, SocketIoModule.forRoot(config)],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
