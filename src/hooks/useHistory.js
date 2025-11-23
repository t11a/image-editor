import { useState, useCallback } from 'react';

const useHistory = () => {
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const saveHistory = useCallback((currentState) => {
    setHistory((prev) => [...prev, currentState]);
    setRedoStack([]);
  }, []);

  const undo = useCallback(
    (currentState, setCurrentState) => {
      if (history.length === 0) return;
      const previous = history[history.length - 1];
      setRedoStack((prev) => [...prev, currentState]);
      setCurrentState(previous);
      setHistory((prev) => prev.slice(0, -1));
    },
    [history]
  );

  const redo = useCallback(
    (currentState, setCurrentState) => {
      if (redoStack.length === 0) return;
      const next = redoStack[redoStack.length - 1];
      setHistory((prev) => [...prev, currentState]);
      setCurrentState(next);
      setRedoStack((prev) => prev.slice(0, -1));
    },
    [redoStack]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    setRedoStack([]);
  }, []);

  return {
    history,
    redoStack,
    saveHistory,
    undo,
    redo,
    clearHistory,
  };
};

export default useHistory;
