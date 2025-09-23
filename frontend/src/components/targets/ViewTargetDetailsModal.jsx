import React from 'react';
import { X, Target, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

const ViewTargetDetailsModal = ({ isOpen, onClose, target, formatCurrency }) => {
  if (!isOpen || !target) return null;

  const isNetWorth = target.target_type === 'net_worth';
  const modalTitle = isNetWorth ? 'Net Worth Milestone Details' : 'Financial Goal Details';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {target.status === 'completed' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  ✅ {modalTitle}
                </>
              ) : (
                <>
                  <Target className="h-5 w-5" />
                  📋 {modalTitle}
                </>
              )}
            </CardTitle>
            <CardDescription>
              {target.status === 'completed' ? 'Completed target details' : 'Target information and progress'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Target Name</h4>
              <p className="font-semibold">{target.name}</p>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Target Amount</h4>
              <p className="text-xl font-bold">{formatCurrency(target.target_amount)}</p>
            </div>

            {target.target_date && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Target Date</h4>
                <p className="font-medium">
                  {new Date(target.target_date).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}

            {target.description && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
                <p className="text-sm">{target.description}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
              <Badge variant={target.status === 'completed' ? 'default' : 'secondary'}>
                {target.status.charAt(0).toUpperCase() + target.status.slice(1)}
              </Badge>
            </div>

            {target.total_allocated_amount && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Total Allocated</h4>
                <p className="font-medium">{formatCurrency(target.total_allocated_amount)}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Created</h4>
              <p className="text-sm">
                {new Date(target.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {target.status === 'completed' && target.updated_at && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Completed</h4>
                <p className="text-sm">
                  {new Date(target.updated_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button 
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewTargetDetailsModal;