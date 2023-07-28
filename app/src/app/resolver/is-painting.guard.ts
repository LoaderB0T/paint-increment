import { LobbyComponent } from '../lobby/lobby.component';
import { CanDeactivateFn } from '@angular/router';

export const isPaintingGuard: CanDeactivateFn<LobbyComponent> = (component: LobbyComponent) => {
  return !component.canPaint;
};
