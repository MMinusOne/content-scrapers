import type { RequestResponse } from "../types";

export class RequestManager {
  private static async fetchWithRetry(
    input: string | URL | Request,
    init: RequestInit = {},
    retries = 3,
    delay = 500,
  ): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);

      try {
        const response = await fetch(input, {
          ...init,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          if (response.status >= 500 && attempt < retries) {
            throw new Error(`Server error: ${response.status}`);
          }

          throw new Error(`Request failed: ${response.status}`);
        }

        return response;
      } catch (error: any) {
        clearTimeout(timeout);

        const isLastAttempt = attempt === retries;

        if (isLastAttempt) {
          throw new Error(
            `Request failed after ${retries + 1} attempts: ${error.message}`,
          );
        }

        const backoff = delay * Math.pow(2, attempt);
        console.warn(
          `Retry ${attempt + 1} failed. Retrying in ${backoff}ms...`,
        );

        await new Promise((res) => setTimeout(res, backoff));
      }
    }

    throw new Error("Unreachable");
  }

  static async get<ResponseType>(
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<RequestResponse> {
    try {
      const request = await this.fetchWithRetry(input, init);

      const text = await request.text();

      let json: ResponseType;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response");
      }

      return {
        data: json,
        status: request.status,
      };
    } catch (error: any) {
      console.error("[GET ERROR]", error.message);
      throw error;
    }
  }

  static async getAsText(
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<RequestResponse> {
    try {
      const request = await this.fetchWithRetry(input, init);

      const text = await request.text();

      return {
        data: text,
        status: request.status,
      };
    } catch (error: any) {
      console.error("[GET TEXT ERROR]", error.message);
      throw error;
    }
  }
}
