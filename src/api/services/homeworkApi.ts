import { apiClient } from "../apiClient";

export const homeworkApi = {
  list(groupId?: number, lessonId?: number) {
    const query = new URLSearchParams();
    if (groupId) query.set("groupId", String(groupId));
    if (lessonId) query.set("lessonId", String(lessonId));
    return apiClient.request(`/homework${query.toString() ? `?${query}` : ""}`);
  },
  create(input: {groupId:number; lessonId:number; title:string; description?:string; deadline:string; fileUrl?:string}) {
    return apiClient.request("/homework", {method:"POST", body:JSON.stringify(input)});
  },
  update(id:number,input:Partial<{title:string;description:string;deadline:string;fileUrl:string}>) {
    return apiClient.request(`/homework/${id}`, {method:"PATCH",body:JSON.stringify(input)});
  },
  remove(id:number) { return apiClient.request(`/homework/${id}`, {method:"DELETE"}); },
  submissions(homeworkId:number) { return apiClient.request(`/submissions/homework/${homeworkId}`); },
  submit(homeworkId:number, content?:string, fileUrl?:string) {
    return apiClient.request("/submissions", {method:"POST",body:JSON.stringify({homeworkId,content,fileUrl})});
  },
  grade(id:number,input:{status:"ACCEPTED"|"NEEDS_REVISION";grade?:number;feedback?:string}) {
    return apiClient.request(`/submissions/${id}/grade`, {method:"PATCH",body:JSON.stringify(input)});
  },
  mySubmissions() { return apiClient.request("/submissions/my"); },
};
