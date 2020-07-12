import { EngineService } from "./../../engine/engine.service";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-ui-infobar-top",
  templateUrl: "./ui-infobar-top.component.html",
  styleUrls: ["./ui-infobar-top.component.scss"],
})
export class UiInfobarTopComponent implements OnInit {
  public constructor(private engineService: EngineService) {}

  public ngOnInit(): void {}
  enableControl() {
    this.engineService.orbitControls.enabled = !this.engineService.orbitControls
      .enabled;
    this.engineService.dragControls.enabled = !this.engineService.dragControls
      .enabled;
  }
}
