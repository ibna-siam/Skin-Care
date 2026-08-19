import { api } from './api';
import { ApiResponse, SkinQuizResult } from '@skincare/shared';

export const skinGuideService = {
  async getQuestions() {
    const res = await api.get<ApiResponse<any[]>>('/skin-guide/questions');
    return res.data.data || [];
  },

  async submitQuiz(data: { skinTypeSlug: string; concernSlug: string; sensitivity?: string; gender?: string }) {
    const res = await api.post<ApiResponse<SkinQuizResult>>('/skin-guide/recommendations', data);
    return res.data.data;
  },
};
