import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Trash } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { InodeMeta } from '../../types';
import { Button } from '@/components/ui/button';

type DeleteDialogProps = {
    type: InodeMeta['type'];
    name: string;
    action: () => void;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
};

export function DeleteDialog({ type, name, action, onClick }: DeleteDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'ghost'} size={'icon-xs'} onClick={onClick}>
                    <Trash />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your file
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" className="cursor-pointer">
                            Close
                        </Button>
                    </DialogClose>
                    <Button type="submit" onClick={action} className="cursor-pointer">
                        Yes, delete <code>{name}</code> {type == 'file' ? 'file' : 'folder'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
