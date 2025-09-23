import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { targetsService } from '../../services/targets';
import { queryKeys } from '../../lib/queryKeys';
import { toast } from 'sonner';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

const DeleteConfirmModal = ({ isOpen, onClose, target }) => {
  const queryClient = useQueryClient();

  const deleteTargetMutation = useMutation({
    mutationFn: () => targetsService.deleteTarget(target.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.list() });
      toast.success('Target deleted successfully');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to delete target: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  });

  const handleDelete = () => {
    deleteTargetMutation.mutate();
  };

  if (!isOpen || !target) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              🗑️ Delete Target
            </CardTitle>
            <CardDescription>
              This action cannot be undone
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Are you sure you want to delete "<strong>{target.name}</strong>"? 
              This will permanently remove the target and all associated allocations.
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm">
              <p><strong>Target:</strong> {target.name}</p>
              <p><strong>Amount:</strong> ${target.target_amount?.toLocaleString()}</p>
              {target.target_date && (
                <p><strong>Date:</strong> {new Date(target.target_date).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={deleteTargetMutation.isPending}
              variant="destructive"
              className="flex-1"
            >
              {deleteTargetMutation.isPending ? 'Deleting...' : 'Delete Target'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteConfirmModal;