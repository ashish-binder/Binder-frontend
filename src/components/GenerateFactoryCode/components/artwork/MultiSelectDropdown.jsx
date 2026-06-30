// MultiSelectDropdown — chip-style multi-select with type-to-filter, used by the
// artwork category spec blocks (Step 4). Extracted verbatim from Step4.jsx.
import { useState, useRef, useEffect } from 'react';

const MultiSelectDropdown = ({ value = [], onChange, options = [], hasError = false }) => {
  const [inputVal, setInputVal] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setInputVal('');
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentValues = Array.isArray(value) ? value : [];

  const addValue = (val) => {
    const trimmed = val.trim();
    if (trimmed && !currentValues.includes(trimmed)) {
      onChange([...currentValues, trimmed]);
    }
    setInputVal('');
    setFocusedIndex(-1);
    // Keep dropdown open so user can keep selecting
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const removeValue = (val, e) => {
    e.stopPropagation();
    onChange(currentValues.filter(v => v !== val));
  };

  const filteredOptions = options.filter(
    opt => opt.toLowerCase().includes(inputVal.toLowerCase()) && !currentValues.includes(opt)
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
        addValue(filteredOptions[focusedIndex]);
      } else if (inputVal.trim()) {
        addValue(inputVal);
      }
    } else if (e.key === 'Backspace' && !inputVal && currentValues.length > 0) {
      onChange(currentValues.slice(0, -1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(i => Math.min(i + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setFocusedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        className={`border-2 rounded-lg text-sm transition-all bg-background ${hasError ? 'border-red-600' : isOpen ? 'border-primary' : 'border-border'}`}
        style={{ minHeight: '44px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px', cursor: 'text', width: '100%', boxSizing: 'border-box' }}
        onClick={() => { inputRef.current?.focus(); setIsOpen(true); }}
      >
        {currentValues.map(v => (
          <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0f0f0', color: '#333', borderRadius: '999px', padding: '5px 14px', fontSize: '13px', fontWeight: 400, lineHeight: 1.4, border: '1px solid #e0e0e0', alignSelf: 'flex-start' }}>
            {v}
            <button
              type="button"
              onClick={(e) => removeValue(v, e)}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0, fontSize: '16px', lineHeight: 1, display: 'flex', alignItems: 'center' }}
            >×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => { setInputVal(e.target.value); setIsOpen(true); setFocusedIndex(-1); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Add more..."
          style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: 'var(--muted-foreground, #9ca3af)', padding: '2px 4px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <div style={{ position: 'absolute', zIndex: 9999, width: '100%', background: 'var(--background)', border: '2px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', marginTop: '4px', maxHeight: '220px', overflowY: 'auto' }}>
          {filteredOptions.map((opt, i) => (
            <div
              key={opt}
              onMouseDown={(e) => { e.preventDefault(); addValue(opt); }}
              onMouseEnter={() => setFocusedIndex(i)}
              style={{ padding: '9px 14px', fontSize: '13px', cursor: 'pointer', color: 'var(--foreground)', background: i === focusedIndex ? 'var(--muted)' : 'transparent', borderBottom: i < filteredOptions.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
