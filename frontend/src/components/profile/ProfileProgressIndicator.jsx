import React from 'react'
import { Card, CardContent } from '../ui/card.jsx'
import { Progress } from '../ui/progress.jsx'
import { getProfileCompletionStatus } from '../../utils/profileUtils.js'

const ProfileProgressIndicator = ({ profile, className = '' }) => {
  const completion = React.useMemo(() => {
    const requiredFields = [
      'first_name',
      'last_name', 
      'date_of_birth',
      'phone_number',
      'city',
      'country',
      'occupation',
      'risk_appetite'
    ];
    
    const optionalFields = [
      'marital_status',
      'gender',
      'children',
      'dependents',
      'state',
      'pin_code',
      'nationality',
      'annual_income',
      'credit_score_value'
    ];
    
    let filledCount = 0;
    let totalWeight = 0;
    
    // Required fields have weight of 2
    requiredFields.forEach(field => {
      totalWeight += 2;
      if (profile[field] && profile[field].toString().trim() !== '') {
        filledCount += 2;
      }
    });
    
    // Optional fields have weight of 1
    optionalFields.forEach(field => {
      totalWeight += 1;
      if (profile[field] && profile[field].toString().trim() !== '') {
        filledCount += 1;
      }
    });
    
    const percentage = Math.round((filledCount / totalWeight) * 100);
    
    return {
      percentage,
      requiredMissing: requiredFields.filter(field => 
        !profile[field] || profile[field].toString().trim() === ''
      ),
      requiredFilled: requiredFields.filter(field => 
        profile[field] && profile[field].toString().trim() !== ''
      ).length,
      requiredTotal: requiredFields.length
    };
  }, [profile]);

  const status = getProfileCompletionStatus(completion.percentage);

  return (
    <Card className={`${status.borderColor} border-2 ${className}`}>
      <CardContent className={`p-3 ${status.bgColor}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{status.emoji}</span>
            <div>
              <h3 className={`text-sm font-semibold ${status.color}`}>
                {completion.percentage}% Profile Complete
              </h3>
              <p className={`text-xs ${status.color} opacity-80`}>
                {status.message}
              </p>
            </div>
          </div>
          <div className={`text-right text-xs ${status.color}`}>
            <div className="font-medium">
              {completion.requiredFilled}/{completion.requiredTotal} Required
            </div>
            <div className="text-xs opacity-70">
              Essential info filled
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{completion.percentage}%</span>
          </div>
          <Progress 
            value={completion.percentage} 
            className="h-2"
          />
        </div>
        
        {completion.requiredMissing.length > 0 && (
          <div className="mt-2 pt-2 border-t border-current border-opacity-20">
            <p className={`text-xs ${status.color} opacity-80 mb-1`}>
              Missing required fields:
            </p>
            <div className="flex flex-wrap gap-1">
              {completion.requiredMissing.map(field => {
                const fieldLabels = {
                  'first_name': 'First Name',
                  'last_name': 'Last Name',
                  'date_of_birth': 'Date of Birth',
                  'phone_number': 'Phone Number',
                  'city': 'City',
                  'country': 'Country',
                  'occupation': 'Occupation',
                  'risk_appetite': 'Risk Appetite'
                };
                
                return (
                  <span 
                    key={field}
                    className={`text-xs px-1.5 py-0.5 rounded-full ${status.color} bg-white bg-opacity-50`}
                  >
                    {fieldLabels[field] || field}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileProgressIndicator;
