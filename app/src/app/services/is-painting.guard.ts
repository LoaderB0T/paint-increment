import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { LobbyComponent } from '../lobby/lobby.component';

@Injectable({
  providedIn: 'root'
})
export class IsPaintingGuard implements CanDeactivate<LobbyComponent> {
  canDeactivate(component: LobbyComponent): boolean {
    return !component.canPaint;
  }
}
