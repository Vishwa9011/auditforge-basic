import { Input } from '@/components/ui/input';
import { useState, type FormEvent } from 'react';

type NodeNameInputProps = {
    isOpen: boolean;
    onBlur: () => void;
    defaultValue?: string;
    onSubmit: (name: string) => void;
};

export function NodeNameInput({ isOpen, onBlur, onSubmit, defaultValue }: NodeNameInputProps) {
    const [inputValue, setInputValue] = useState(defaultValue || '');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(inputValue);
        setInputValue('');
    };

    if (!isOpen) return null;
    return (
        <div className="flex min-w-0 flex-1">
            <form className="w-full" onSubmit={handleSubmit}>
                <Input
                    type="text"
                    maxLength={25}
                    onBlur={onBlur}
                    autoFocus
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    className="bg-background h-7 px-2 text-sm"
                />
            </form>
        </div>
    );
}
