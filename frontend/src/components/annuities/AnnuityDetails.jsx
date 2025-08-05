import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Plus, TrendingUp, Calendar, DollarSign, FileText, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useTheme } from '../../hooks/useTheme';
import annuityService from '../../services/annuities';
import AnnuityForm from './AnnuityForm';
import { 
  formatAnnuityValue, 
  formatPercentage,
  getAnnuityTypeInfo,
  CONTRACT_STATUSES,
  PAYOUT_OPTIONS,
  DEATH_BENEFIT_TYPES,
  TAX_QUALIFICATIONS
} from '../../constants/annuityTypes';

const AnnuityDetails = ({ annuity, onUpdate, onDelete, onClose }) => {
  const { theme } = useTheme();
  const [showEditForm, setShowEditForm] = useState(false);
  const [contributions, setContributions] = useState([]);
  const [valuations, setValuations] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [annuity.id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [contributionsData, valuationsData, performanceData] = await Promise.all([
        annuityService.getContributions(annuity.id),
        annuityService.getValuations(annuity.id),
        annuityService.getPerformance(annuity.id)
      ]);
      
      setContributions(contributionsData);
      setValuations(valuationsData);
      setPerformance(performanceData);
    } catch (error) {
      console.error('Error fetching annuity details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (updateData) => {
    try {
      await onUpdate(annuity.id, updateData);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating annuity:', error);
    }
  };

  const typeInfo = getAnnuityTypeInfo(annuity.annuity_type);
  const statusInfo = CONTRACT_STATUSES[annuity.contract_status];
  const currentValue = annuity.accumulation_value || annuity.initial_premium;
  const gainLoss = currentValue - annuity.initial_premium;
  const gainLossPercentage = (gainLoss / annuity.initial_premium) * 100;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{typeInfo.icon}</div>
                <div>
                  <CardTitle className="text-xl font-bold">{annuity.product_name}</CardTitle>
                  <p className="text-muted-foreground">{annuity.provider_company}</p>
                  {annuity.contract_number && (
                    <p className="text-sm text-muted-foreground">Contract: {annuity.contract_number}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => onDelete(annuity.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Status and Type Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge 
                  variant={annuity.contract_status === 'active' ? 'default' : 'secondary'}
                  className="text-sm"
                >
                  {statusInfo?.label || annuity.contract_status}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {typeInfo.label}
                </Badge>
                {annuity.tax_qualification && (
                  <Badge variant="outline" className="text-sm">
                    {TAX_QUALIFICATIONS[annuity.tax_qualification]?.label}
                  </Badge>
                )}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Initial Premium</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatAnnuityValue(annuity.initial_premium)}</div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(annuity.purchase_date).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatAnnuityValue(currentValue)}</div>
                    {annuity.cash_surrender_value && (
                      <p className="text-xs text-muted-foreground">
                        Surrender: {formatAnnuityValue(annuity.cash_surrender_value)}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gain/Loss</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatAnnuityValue(gainLoss)}
                    </div>
                    <p className={`text-xs ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Guaranteed Rate</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {annuity.guaranteed_rate ? formatPercentage(annuity.guaranteed_rate) : 'N/A'}
                    </div>
                    {annuity.current_rate && (
                      <p className="text-xs text-muted-foreground">
                        Current: {formatPercentage(annuity.current_rate)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Information Tabs */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="payout">Payout</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Contract Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Purchase Date:</span>
                          <span>{new Date(annuity.purchase_date).toLocaleDateString()}</span>
                        </div>
                        {annuity.funding_type && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Funding Type:</span>
                            <span>{annuity.funding_type.replace('_', ' ').toUpperCase()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Additional Premiums:</span>
                          <span>{annuity.additional_premiums_allowed ? 'Allowed' : 'Not Allowed'}</span>
                        </div>
                        {annuity.surrender_period_years && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Surrender Period:</span>
                            <span>{annuity.surrender_period_years} years</span>
                          </div>
                        )}
                        {annuity.free_withdrawal_percentage && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Free Withdrawal:</span>
                            <span>{annuity.free_withdrawal_percentage}% annually</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Beneficiary Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {annuity.primary_beneficiary && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Primary Beneficiary:</span>
                            <span>{annuity.primary_beneficiary}</span>
                          </div>
                        )}
                        {annuity.primary_beneficiary_percentage && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Primary Percentage:</span>
                            <span>{annuity.primary_beneficiary_percentage}%</span>
                          </div>
                        )}
                        {annuity.contingent_beneficiary && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Contingent Beneficiary:</span>
                            <span>{annuity.contingent_beneficiary}</span>
                          </div>
                        )}
                        {annuity.death_benefit_type && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Death Benefit:</span>
                            <span>{DEATH_BENEFIT_TYPES[annuity.death_benefit_type]?.label}</span>
                          </div>
                        )}
                        {annuity.death_benefit_amount && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Death Benefit Amount:</span>
                            <span>{formatAnnuityValue(annuity.death_benefit_amount)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Riders and Features */}
                  {(annuity.living_benefit_rider || annuity.long_term_care_rider || 
                    annuity.income_rider || annuity.enhanced_death_benefit || 
                    annuity.cost_of_living_adjustment) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Riders & Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {annuity.living_benefit_rider && <Badge variant="outline">Living Benefit Rider</Badge>}
                          {annuity.long_term_care_rider && <Badge variant="outline">Long-Term Care Rider</Badge>}
                          {annuity.income_rider && <Badge variant="outline">Income Rider</Badge>}
                          {annuity.enhanced_death_benefit && <Badge variant="outline">Enhanced Death Benefit</Badge>}
                          {annuity.cost_of_living_adjustment && <Badge variant="outline">Cost of Living Adjustment</Badge>}
                        </div>
                        {annuity.rider_fees_annual > 0 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Annual rider fees: {formatAnnuityValue(annuity.rider_fees_annual)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Notes */}
                  {annuity.notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{annuity.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Interest Rates</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {annuity.guaranteed_rate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Guaranteed Rate:</span>
                            <span className="font-medium">{formatPercentage(annuity.guaranteed_rate)}</span>
                          </div>
                        )}
                        {annuity.current_rate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Rate:</span>
                            <span className="font-medium">{formatPercentage(annuity.current_rate)}</span>
                          </div>
                        )}
                        {annuity.participation_rate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Participation Rate:</span>
                            <span className="font-medium">{formatPercentage(annuity.participation_rate)}</span>
                          </div>
                        )}
                        {annuity.cap_rate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cap Rate:</span>
                            <span className="font-medium">{formatPercentage(annuity.cap_rate)}</span>
                          </div>
                        )}
                        {annuity.floor_rate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Floor Rate:</span>
                            <span className="font-medium">{formatPercentage(annuity.floor_rate)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Current Values</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Accumulation Value:</span>
                          <span className="font-medium">{formatAnnuityValue(annuity.accumulation_value || annuity.initial_premium)}</span>
                        </div>
                        {annuity.cash_surrender_value && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cash Surrender Value:</span>
                            <span className="font-medium">{formatAnnuityValue(annuity.cash_surrender_value)}</span>
                          </div>
                        )}
                        {annuity.surrender_charge_rate && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Surrender Charge Rate:</span>
                            <span className="font-medium">{formatPercentage(annuity.surrender_charge_rate)}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {annuity.underlying_index && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Index Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Underlying Index:</span>
                          <span className="font-medium">{annuity.underlying_index}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="payout" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payout Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {annuity.annuitization_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Annuitization Date:</span>
                          <span>{new Date(annuity.annuitization_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {annuity.payout_option && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payout Option:</span>
                          <span>{PAYOUT_OPTIONS[annuity.payout_option]?.label}</span>
                        </div>
                      )}
                      {annuity.payout_frequency && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payout Frequency:</span>
                          <span>{annuity.payout_frequency}</span>
                        </div>
                      )}
                      {annuity.payout_amount && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payout Amount:</span>
                          <span className="font-medium">{formatAnnuityValue(annuity.payout_amount)}</span>
                        </div>
                      )}
                      {annuity.guaranteed_period_years && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Guaranteed Period:</span>
                          <span>{annuity.guaranteed_period_years} years</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                  {performance && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Contributions:</span>
                            <span className="font-medium">{formatAnnuityValue(performance.total_contributions)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Value:</span>
                            <span className="font-medium">{formatAnnuityValue(performance.current_value)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Return:</span>
                            <span className={`font-medium ${performance.total_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatAnnuityValue(performance.total_return)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Return Percentage:</span>
                            <span className={`font-medium ${performance.return_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {performance.return_percentage >= 0 ? '+' : ''}{performance.return_percentage}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Annualized Return:</span>
                            <span className={`font-medium ${performance.annualized_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {performance.annualized_return >= 0 ? '+' : ''}{performance.annualized_return}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Years Held:</span>
                            <span>{performance.years_held} years</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  {/* Contributions History */}
                  {contributions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Contribution History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {contributions.map((contribution) => (
                            <div key={contribution.id} className="flex justify-between items-center py-2 border-b">
                              <div>
                                <div className="font-medium">{formatAnnuityValue(contribution.amount)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {contribution.contribution_type} - {new Date(contribution.contribution_date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Valuation History */}
                  {valuations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Valuation History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {valuations.slice(0, 10).map((valuation) => (
                            <div key={valuation.id} className="flex justify-between items-center py-2 border-b">
                              <div>
                                <div className="font-medium">{formatAnnuityValue(valuation.accumulation_value)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(valuation.valuation_date).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm">{formatAnnuityValue(valuation.cash_surrender_value)}</div>
                                <div className="text-xs text-muted-foreground">Surrender Value</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <AnnuityForm
          annuity={annuity}
          onSubmit={handleEdit}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </>
  );
};

export default AnnuityDetails;
