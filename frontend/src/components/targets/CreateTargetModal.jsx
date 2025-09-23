import React, { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const CreateTargetModal = ({ isOpen, onClose, targetType = 'custom' }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    target_date: '',
    target_type: targetType
  });

  const createTargetMutation = useMutation({
    mutationFn: (data) => targetsService.createTarget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.targets.list() });
      toast.success('Target created successfully!');
      onClose();
      setFormData({
        name: '',
        description: '',
        target_amount: '',
        target_date: '',
        target_type: targetType
      });
    },
    onError: (error) => {
      toast.error('Failed to create target: ' + (error.response?.data?.detail || 'Unknown error'));
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

    createTargetMutation.mutate(targetData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const isNetWorth = targetType === 'net_worth';
  const modalTitle = isNetWorth ? 'Set Net Worth Milestone' : 'Create Financial Goal';
  const nameLabel = isNetWorth ? 'Milestone Name' : 'Goal Name';
  const amountLabel = isNetWorth ? 'Target Net Worth' : 'Target Amount';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isNetWorth ? (
                <>
                  <Target className="h-5 w-5" />
                  🏆 {modalTitle}
                </>
              ) : (
                <>
                  <Target className="h-5 w-5" />
                  🎯 {modalTitle}
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isNetWorth 
                ? 'Set your net worth milestone to track overall financial progress'
                : 'Create a new savings goal to work towards'
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
                disabled={createTargetMutation.isPending}
                className="flex-1"
              >
                {createTargetMutation.isPending ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTargetModal;