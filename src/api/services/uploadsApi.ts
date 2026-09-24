import { apiClient } from "../apiClient";

export const uploadsApi = {
  async file(file: File): Promise<{ url: string; originalName?: string; sizeMb?: number }> {
    const form = new FormData();
    form.append("file", file);
    return apiClient.uploadFile(form);
  },
};
