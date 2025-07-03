import api from './api';

// Description: Generate AutoHotkey script from description
// Endpoint: POST /api/scripts/generate
// Request: { description: string }
// Response: { script: string, success: boolean }
export const generateScript = async (data: { description: string }) => {
  try {
    const response = await api.post('/api/scripts/generate', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Save generated script to user's history
// Endpoint: POST /api/scripts/save
// Request: { name: string, description: string, script: string, originalDescription: string }
// Response: { success: boolean, scriptId: string }
export const saveScript = async (data: { name: string; description: string; script: string; originalDescription: string }) => {
  try {
    const response = await api.post('/api/scripts/save', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get user's saved scripts
// Endpoint: GET /api/scripts/history
// Request: {}
// Response: { scripts: Array<{ _id: string, name: string, description: string, script: string, originalDescription: string, createdAt: string }> }
export const getScriptHistory = async () => {
  try {
    const response = await api.get('/api/scripts/history');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Delete a saved script
// Endpoint: DELETE /api/scripts/:id
// Request: { id: string }
// Response: { success: boolean }
export const deleteScript = async (id: string) => {
  try {
    const response = await api.delete(`/api/scripts/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update script details
// Endpoint: PUT /api/scripts/:id
// Request: { id: string, name: string, description: string }
// Response: { success: boolean }
export const updateScript = async (data: { id: string; name: string; description: string }) => {
  try {
    const response = await api.put(`/api/scripts/${data.id}`, { name: data.name, description: data.description });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
};