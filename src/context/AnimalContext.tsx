import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { AnimalRecord, RecognizeResult } from '../types/animal';

interface AnimalContextType {
  animals: AnimalRecord[];
  setAnimals: React.Dispatch<React.SetStateAction<AnimalRecord[]>>;
  currentAnimal: AnimalRecord | null;
  setCurrentAnimal: React.Dispatch<React.SetStateAction<AnimalRecord | null>>;
  recognizeResult: RecognizeResult | null;
  setRecognizeResult: React.Dispatch<React.SetStateAction<RecognizeResult | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AnimalContext = createContext<AnimalContextType | undefined>(undefined);

export const useAnimalContext = () => {
  const context = useContext(AnimalContext);
  if (!context) {
    throw new Error('useAnimalContext must be used within an AnimalProvider');
  }
  return context;
};

interface AnimalProviderProps {
  children: ReactNode;
}

export const AnimalProvider: React.FC<AnimalProviderProps> = ({ children }) => {
  const [animals, setAnimals] = useState<AnimalRecord[]>([]);
  const [currentAnimal, setCurrentAnimal] = useState<AnimalRecord | null>(null);
  const [recognizeResult, setRecognizeResult] = useState<RecognizeResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <AnimalContext.Provider
      value={{
        animals,
        setAnimals,
        currentAnimal,
        setCurrentAnimal,
        recognizeResult,
        setRecognizeResult,
        loading,
        setLoading,
      }}
    >
      {children}
    </AnimalContext.Provider>
  );
};
