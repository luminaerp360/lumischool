import { Component } from "@angular/core";
import { ThemeService } from "./shared/services/theme/theme.service";

@Component({
  selector: "app-root",
  template: "<router-outlet></router-outlet>",
  styles: [":host { display: block; height: 100vh; }"],
})
export class AppComponent {
  title = "LumiSchool";

  constructor(private themeService: ThemeService) {}
}
