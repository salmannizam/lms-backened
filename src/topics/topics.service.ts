import { Injectable } from '@nestjs/common';

interface Session {
  userId: number;
  topicId: string;
  startTime: number;
  timeSpent: number;
  endTime?: number;
}

interface Topic {
  id: string;
  name: string;
  sessions: Session[];
}

@Injectable()
export class TopicsService {
  private topics: Topic[] = [];

  // Start a new session for a user on a topic
  async startSession(userId: number, topicId: string): Promise<Session> {
    let topic = this.topics.find((t) => t.id === topicId);

    if (!topic) {
      topic = { id: topicId, name: `Topic ${topicId}`, sessions: [] };
      this.topics.push(topic);
    }

    // Check if the user already has an active session
    let session = topic.sessions.find((s) => s.userId === userId);
    if (!session) {
      session = {
        userId,
        topicId,
        startTime: Date.now(),
        timeSpent: 0,
      };
      topic.sessions.push(session);
    }

    return session;
  }

  // Update the time spent by the user on the topic
  async updateTimeSpent(userId: number, topicId: string, timeSpent: number): Promise<Session | undefined> {
    const topic = this.topics.find((t) => t.id === topicId);
    if (!topic) return undefined;

    const session = topic.sessions.find((s) => s.userId === userId);
    if (session) {
      session.timeSpent = timeSpent;
    }

    return session;
  }

  // Finalize the session when the user finishes or disconnects
  async finalizeSession(userId: number, topicId: string, timeSpent: number): Promise<Session | undefined> {
    const topic = this.topics.find((t) => t.id === topicId);
    if (!topic) return undefined;

    const session = topic.sessions.find((s) => s.userId === userId);
    if (session) {
      session.timeSpent = timeSpent;
      session.endTime = Date.now();
    }

    return session;
  }

  // Get the time spent by a user on a specific topic
  async getTimeSpent(userId: number, topicId: string): Promise<number | undefined> {
    const topic = this.topics.find((t) => t.id === topicId);
    if (!topic) return undefined;

    const session = topic.sessions.find((s) => s.userId === userId);
    return session ? session.timeSpent : undefined;
  }
}
