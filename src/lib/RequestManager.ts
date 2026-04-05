import type { RequestResponse } from "../../types";

export class RequestManager {
  static async get<ResponseType>(
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<RequestResponse> {
    const request = await fetch(input, init);
    const text = await request.text();
    const json = JSON.parse(text);

    return {
      data: json,
      status: request.status,
    };
  }

  static async getAsText(
    input: string | URL | Request,
    init?: RequestInit,
  ): Promise<RequestResponse> {
    const request = await fetch(input, init);
    const text = await request.text();
    return {
      data: text,
      status: request.status,
    };
  }
}
