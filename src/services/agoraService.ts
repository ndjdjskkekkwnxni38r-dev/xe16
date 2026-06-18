import { createAgoraRtcEngine, RtcEngineInterface, IRtcEngineEventHandler } from 'react-native-agora';

const APP_ID = '4b6bae68f4a0486ea3b9d62e7428aef6';

class AgoraService {
  private engine: RtcEngineInterface | null = null;

  async init() {
    console.log('[Agora] Init called');
    if (!this.engine) {
      console.log('[Agora] Creating engine');
      this.engine = createAgoraRtcEngine();
      await this.engine.initialize({appId: APP_ID});
      await this.engine.enableAudio();

      // Thêm EventHandler để debug chi tiết
      const eventHandler: IRtcEngineEventHandler = {
        onJoinChannelSuccess: (connection, elapsed) => {
          console.log('[Agora] Join channel success:', connection.channelId, 'in', elapsed, 'ms');
        },
        onConnectionStateChanged: (connection, state, reason) => {
          console.log('[Agora] Connection state changed:', state, 'Reason:', reason);
        },
        onError: (err, msg) => {
          console.error('[Agora] Error:', err, msg);
        },
        onWarning: (warn, msg) => {
          console.warn('[Agora] Warning:', warn, msg);
        },
        onUserJoined: (connection, uid, elapsed) => {
          console.log('[Agora] User joined:', uid);
        }
      };
      this.engine.registerEventHandler(eventHandler);
    }
    return this.engine;
  }

  async joinChannel(channelName: string, token: string | null = null) {
    console.log('[Agora] joinChannel - Start');
    try {
      const engine = await this.init();
      console.log('[Agora] joinChannel - Engine initialized');
      
      await engine.setChannelProfile(1);
      await engine.setClientRole(1);
      
      console.log('[Agora] joinChannel - Joining channel:', channelName);
      await engine.joinChannel(token, channelName, 0, {
          autoSubscribeAudio: true,
          publishMicrophoneTrack: true,
      });
      console.log('[Agora] joinChannel - Call invoked');
    } catch (e) {
      console.error('[Agora] joinChannel - Critical Error:', e);
    }
  }

  async leaveChannel() {
    await this.engine?.leaveChannel();
  }
}

export default new AgoraService();
