import { Injectable, OnDestroy } from '@angular/core';
import Pusher, { Channel } from 'pusher-js';
import { environment } from '../../environments/environment';

export type PusherEvent = {
  channel: string;
  event: string;
  callback: (data: Record<string, unknown>) => void;
};

@Injectable({ providedIn: 'root' })
export class PusherClientService implements OnDestroy {
  private pusher: Pusher | null = null;
  private channels = new Map<string, Channel>();

  get connected(): boolean {
    return this.pusher?.connection.state === 'connected';
  }

  init(): void {
    if (this.pusher || !environment.pusherKey) return;

    this.pusher = new Pusher(environment.pusherKey, {
      cluster: environment.pusherCluster,
    });

    this.pusher.connection.bind('connected', () => {
      console.log('[Pusher] Connected');
    });

    this.pusher.connection.bind('error', (err: unknown) => {
      console.error('[Pusher] Connection error', err);
    });
  }

  subscribe(channelName: string): Channel | null {
    if (!this.pusher) this.init();
    if (!this.pusher) return null;

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!;
    }

    const channel = this.pusher.subscribe(channelName);
    this.channels.set(channelName, channel);
    return channel;
  }

  on(channelName: string, event: string, callback: (data: Record<string, unknown>) => void): void {
    const channel = this.subscribe(channelName);
    channel?.bind(event, callback);
  }

  off(channelName: string, event: string): void {
    this.channels.get(channelName)?.unbind(event);
  }

  unsubscribe(channelName: string): void {
    this.pusher?.unsubscribe(channelName);
    this.channels.delete(channelName);
  }

  disconnect(): void {
    this.channels.clear();
    this.pusher?.disconnect();
    this.pusher = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
