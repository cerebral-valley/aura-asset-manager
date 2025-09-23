import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { targetsService } from '../../services/targets';
import { queryKeys } from '../../lib/queryKeys';
import { toast } from 'sonner';
import { X, Target, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

const EditTargetModal = ({ isOpen, onClose, target }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    target_date: '',
  });

  // Initialize form data when target changes
  useEffect(() => {
    if (target) {
      setFormData({
        name: target.name || '',
        description: target.description || '',
        target_amount: target.target_amount ? target.target_amount.toString() : '',
        target_date: target.target_date || '',
      });
    }
  }, [target]);

  const updateTargetMutation = useMutation({
    mutationFn: (data) => targetsService.updateTarget(target.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.list() });
      toast.success('Target updated successfully!');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to update target: ' + (error.response?.data?.detail || 'Unknown error'));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.target_amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const targetData = {
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      target_date: formData.target_date || null
    };

    updateTargetMutation.mutate(targetData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen || !target) return null;

  const isNetWorth = target.target_type === 'net_worth';
  const modalTitle = isNetWorth ? 'Edit Net Worth Milestone' : 'Edit Financial Goal';
  const nameLabel = isNetWorth ? 'Milestone Name' : 'Goal Name';
  const amountLabel = isNetWorth ? 'Target Net Worth' : 'Target Amount';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ✏️ {modalTitle}
            </CardTitle>
            <CardDescription>
              {isNetWorth 
                ? 'Update your net worth milestone and target date'
                : 'Modify your savings goal details and timeline'
              }
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">{nameLabel} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={isNetWorth ? "e.g., Financial Independence" : "e.g., Dream Vacation"}
                required
              />
            </div>

            <div>
              <Label htmlFor="target_amount">{amountLabel} *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="target_amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={(e) => handleInputChange('target_amount', e.target.value)}
                  placeholder={isNetWorth ? "500000" : "15000"}
                  className="pl-9"
                  min="0"
                  step="100"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="target_date">Target Date (Optional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => handleInputChange('target_date', e.target.value)}
                  className="pl-9"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={isNetWorth 
                  ? "Your path to financial security and peace of mind" 
                  : "What does achieving this goal mean to you?"
                }
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateTargetMutation.isPending}
                className="flex-1"
              >
                {updateTargetMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTargetModal;