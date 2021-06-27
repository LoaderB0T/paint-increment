import { Injectable } from '@angular/core';
import { LobbyCache } from '../models/lobby-cache.model';

@Injectable({
  providedIn: 'root'
})
export class LobbyCacheService {
  public getCache(lobbyId: string): LobbyCache {
    const cache = JSON.parse(localStorage.getItem('lobby-' + lobbyId) ?? '{}');
    return cache;
  }

  private saveCache(lobbyId: string, cache: LobbyCache) {
    if (!cache) {
      localStorage.removeItem('lobby-' + lobbyId);
    } else {
      localStorage.setItem('lobby-' + lobbyId, JSON.stringify(cache));
    }
  }

  private modifyCache(lobbyId: string, modifier: (cache: LobbyCache) => void) {
    const cache = this.getCache(lobbyId);
    modifier(cache);
    this.saveCache(lobbyId, cache);
  }

  public usedInviteCode(lobbyId: string, code: string) {
    this.modifyCache(lobbyId, c => {
      c.usedInviteCodes ??= [];
      c.usedInviteCodes.push(code);
    });
  }

  public addCreatorToken(lobbyId: string, token: string) {
    this.modifyCache(lobbyId, c => {
      c.creatorToken = token;
    });
  }
}
