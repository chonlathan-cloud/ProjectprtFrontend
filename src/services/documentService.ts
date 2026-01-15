import { DocumentData } from '../components/DocumentTemplates';

// Simulated database
let counter = {
  withdrawal: 124,
  return: 45,
  purchase: 89
};

export const getNextDocNumber = async (type: 'withdrawal' | 'return' | 'purchase'): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let prefix = 'DOC';
  if (type === 'withdrawal') prefix = 'CR';
  else if (type === 'return') prefix = 'DB';
  else if (type === 'purchase') prefix = 'PS';
  
  const nextId = (counter[type] + 1).toString().padStart(4, '0');
  
  return `${prefix}-${nextId}`;
};

export const saveDocument = async (data: DocumentData): Promise<{ success: boolean; docNo: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate the number at point of save
  let prefix = 'DOC';
  if (data.type === 'withdrawal') prefix = 'CR';
  else if (data.type === 'return') prefix = 'DB';
  else if (data.type === 'purchase') prefix = 'PS';
  
  const nextId = (counter[data.type] + 1).toString().padStart(4, '0');
  const generatedDocNo = `${prefix}-${nextId}`;

  // In a real app, this would be an actual POST request
  console.log('Saving document to backend with generated No:', generatedDocNo, data);
  
  // Update counter for next time
  counter[data.type]++;
  
  return { 
    success: true, 
    docNo: '' // Return empty for now as requested
  };
};
