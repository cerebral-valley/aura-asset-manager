import axios from 'axios'

export const feedbackService = {
  async submitFeedback(userId, feedbackText) {
    const res = await axios.post('/api/v1/feedback', {
      feedback_text: feedbackText
    })
    return res.data
  }
}
