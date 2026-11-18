import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Download,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  CreditCard,
  Copy,
  Check,
  MoreHorizontal,
  Clock,
  XCircle,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getToken } from '@/lib/api';

interface Payment {
  _id: string;
  studentId?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  teacherId?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  courseId?: {
    _id?: string;
    name?: string | { en: string };
  };
  sessionDate?: string;
  duration?: number;
  studentCount?: number;
  pricingSnapshot?: {
    baseAmountUSD?: number;
    platformFeeUSD?: number;
    studentPaid?: {
      amount: number;
      currency: string;
    };
  };
  payout?: {
    teacherAmountUSD?: number;
    teacherAmountINR?: number;
    teacherCurrency?: string;
    status: 'pending' | 'paid' | 'failed';
  };
  payment?: {
    stripePaymentIntentId?: string;
    status?: string;
    rawStatus?: string;
  };
  gateway?: string;
  paymentMethod?: string;
  orderId?: string;
  paymentId?: string;
  bookingId?: string;
  teacherPayoutInfo?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    upiId?: string;
  };
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api';



const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<string>('all');
  const [updatingPayoutId, setUpdatingPayoutId] = useState<string | null>(null);
  const [selectedPayoutPayment, setSelectedPayoutPayment] = useState<Payment | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: 'Copied to clipboard', description: text });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUpdatePayoutStatus = async (paymentId: string, status: 'pending' | 'paid' | 'failed') => {
    setUpdatingPayoutId(paymentId);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/payments/${paymentId}/payout`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update payout status');
      }

      toast({
        title: 'Payout Status Updated',
        description: `Payout marked as ${status.toUpperCase()} successfully.`,
      });

      // Update in state
      setPayments((prev) => {
        const next = prev.map((p) => {
          if (p._id === paymentId || p.bookingId === paymentId) {
            return {
              ...p,
              payout: {
                ...(p.payout || { teacherAmountUSD: 0, teacherCurrency: 'USD' }),
                status,
              },
            };
          }
          return p;
        });
        calculateStats(next);
        return next;
      });

    if (selectedPayoutPayment && (selectedPayoutPayment._id === paymentId || selectedPayoutPayment.bookingId === paymentId)) {
      setSelectedPayoutPayment((prev) =>
        prev
          ? {
            ...prev,
            payout: {
              ...(prev.payout || { teacherAmountUSD: 0, teacherCurrency: 'USD' }),
              status,
            },
          }
          : null
      );
    }
  } catch (err: any) {
    toast({
      title: 'Update Failed',
      description: err.message || 'Could not update payout status',
      variant: 'destructive',
    });
  } finally {
    setUpdatingPayoutId(null);
  }
};

const [stats, setStats] = useState({
  totalRevenue: 0,
  totalPlatformFee: 0,
  pendingPayouts: 0,
  completedPayouts: 0,
});

useEffect(() => {
  loadPayments();
}, []);

useEffect(() => {
  applyFilters();
}, [payments, searchQuery, paymentStatusFilter, payoutStatusFilter]);

const loadPayments = async () => {
  setLoading(true);
  try {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/payments`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to load payments');

    const data = await response.json();
    setPayments(data.payments || []);
    calculateStats(data.payments || []);
  } catch (err: any) {
    toast({ title: 'Error', description: err?.message, variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};

const calculateStats = (paymentsData: Payment[]) => {
  // Only count completed/paid/captured transactions for revenue
  const paidPayments = paymentsData.filter(
    p => p.payment?.status === 'paid' || p.payment?.status === 'captured' || p.payment?.rawStatus === 'captured'
  );
  const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.pricingSnapshot?.studentPaid?.amount || 0), 0);
  const totalPlatformFee = paidPayments.reduce((sum, p) => sum + (p.pricingSnapshot?.platformFeeUSD || 0), 0);
  const pendingPayouts = paymentsData
    .filter(p => p.payout?.status === 'pending')
    .reduce((sum, p) => sum + (p.payout?.teacherAmountUSD || 0), 0);
  const completedPayouts = paymentsData
    .filter(p => p.payout?.status === 'paid')
    .reduce((sum, p) => sum + (p.payout?.teacherAmountUSD || 0), 0);

  setStats({ totalRevenue, totalPlatformFee, pendingPayouts, completedPayouts });
};

const applyFilters = () => {
  let filtered = payments;

  // Payment status filter
  if (paymentStatusFilter !== 'all') {
    filtered = filtered.filter(p => {
      const s = (p.payment?.status || '').toLowerCase();
      const raw = (p.payment?.rawStatus || '').toLowerCase();
      if (paymentStatusFilter === 'paid') {
        return s === 'paid' || raw === 'captured' || s === 'captured';
      }
      return s === paymentStatusFilter || raw === paymentStatusFilter;
    });
  }

  // Payout status filter
  if (payoutStatusFilter !== 'all') {
    filtered = filtered.filter(p => p.payout?.status === payoutStatusFilter);
  }

  // Search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.studentId?.name?.toLowerCase().includes(query) ||
      p.studentId?.email?.toLowerCase().includes(query) ||
      p.teacherId?.name?.toLowerCase().includes(query) ||
      p.teacherId?.email?.toLowerCase().includes(query) ||
      p.payment?.stripePaymentIntentId?.toLowerCase().includes(query) ||
      p.paymentId?.toLowerCase().includes(query) ||
      p.orderId?.toLowerCase().includes(query) ||
      p.gateway?.toLowerCase().includes(query)
    );
  }

  setFilteredPayments(filtered);
};

const getPaymentStatusBadge = (status?: string, rawStatus?: string) => {
  const displayStatus = (rawStatus || status || 'pending').toLowerCase();
  const config: Record<string, { label: string; className: string }> = {
    paid: { label: 'Paid', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    captured: { label: 'Captured', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    authorized: { label: 'Authorized', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    pending: { label: 'Pending', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    failed: { label: 'Failed', className: 'bg-destructive/20 text-destructive border-destructive/30' },
    refunded: { label: 'Refunded', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  };
  const { label, className } = config[displayStatus] || {
    label: displayStatus ? displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1) : 'Pending',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const getGatewayBadge = (gateway?: string, method?: string) => {
  const gw = (gateway || '').toLowerCase();
  if (gw === 'razorpay') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
        Razorpay {method ? `(${method})` : ''}
      </span>
    );
  }
  if (gw === 'stripe') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
        Stripe
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">
      {gateway || 'Direct'}
    </span>
  );
};

const getPayoutStatusBadge = (status: string) => {
  const config = {
    paid: { label: 'Paid', className: 'bg-success/20 text-success border-success/30' },
    pending: { label: 'Pending', className: 'bg-warning/20 text-warning border-warning/30' },
    failed: { label: 'Failed', className: 'bg-destructive/20 text-destructive border-destructive/30' },
  };
  const { label, className } = config[status as keyof typeof config] || config.pending;
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number, currency: string = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const getCourseName = (course: any) => {
  if (!course) return 'N/A';
  if (typeof course.name === 'string') return course.name;
  return course.name?.en || 'N/A';
};

return (
  <AdminLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="mt-1 text-muted-foreground">
            Manage all transactions, payments, and payouts
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-success/20 p-3">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">
                ₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/20 p-3">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Platform Fee</p>
              <p className="text-2xl font-bold text-foreground">
                ₹{stats.totalPlatformFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-warning/20 p-3">
              <AlertCircle className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Payouts</p>
              <p className="text-2xl font-bold text-foreground">
                ₹{stats.pendingPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-success/20 p-3">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid Payouts</p>
              <p className="text-2xl font-bold text-foreground">
                ₹{stats.completedPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student, teacher, or payment ID..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid / Captured</SelectItem>
              <SelectItem value="authorized">Authorized</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={payoutStatusFilter} onValueChange={setPayoutStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Payout Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payouts</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Teacher Payout</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Payout Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    <div className="text-muted-foreground">Loading payments...</div>
                  </TableCell>
                </TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    <div className="text-muted-foreground">No payments found</div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-medium">
                      {formatDate(payment.sessionDate || payment.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.studentId?.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">
                          {payment.studentId?.email || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.teacherId?.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">
                          {payment.teacherId?.email || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px]">
                        <div className="truncate">{getCourseName(payment.courseId)}</div>
                        <div className="text-xs text-muted-foreground">
                          {payment.duration} min
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <span className="font-semibold">{payment.studentCount || 1}</span>
                        <div className="text-xs text-muted-foreground">
                          {payment.studentCount === 1 ? 'student' : 'students'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(
                          payment.pricingSnapshot?.studentPaid?.amount || 0,
                          payment.pricingSnapshot?.studentPaid?.currency || 'INR'
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-muted-foreground">
                        ₹{(payment.pricingSnapshot?.platformFeeUSD ? payment.pricingSnapshot.platformFeeUSD * 83.33 : 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ₹{(payment.payout?.teacherAmountINR || (payment.payout?.teacherAmountUSD ? payment.payout.teacherAmountUSD * 83.33 : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{getPaymentStatusBadge(payment.payment?.status, payment.payment?.rawStatus)}</div>
                        <div>{getGatewayBadge(payment.gateway, payment.paymentMethod)}</div>
                        {(payment.paymentId || payment.orderId || payment.payment?.stripePaymentIntentId) && (
                          <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[130px]" title={payment.paymentId || payment.orderId || payment.payment?.stripePaymentIntentId}>
                            {payment.paymentId || payment.orderId || payment.payment?.stripePaymentIntentId}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={updatingPayoutId === payment._id}
                            className="h-auto px-2 py-1 font-normal flex items-center gap-1.5 hover:bg-muted/60 rounded-md border border-transparent hover:border-border transition-colors cursor-pointer"
                          >
                            {getPayoutStatusBadge(payment.payout?.status || 'pending')}
                            <ChevronDown className="h-3 w-3 text-muted-foreground opacity-70" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                          <DropdownMenuLabel className="text-xs text-muted-foreground">Change Payout Status</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleUpdatePayoutStatus(payment._id, 'paid')}
                            className="text-emerald-500 focus:text-emerald-500 gap-2 cursor-pointer font-medium"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdatePayoutStatus(payment._id, 'pending')}
                            className="text-amber-500 focus:text-amber-500 gap-2 cursor-pointer font-medium"
                          >
                            <Clock className="h-4 w-4" />
                            Mark as Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdatePayoutStatus(payment._id, 'failed')}
                            className="text-destructive focus:text-destructive gap-2 cursor-pointer font-medium"
                          >
                            <XCircle className="h-4 w-4" />
                            Mark as Failed
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            onClick={() => setSelectedPayoutPayment(payment)}
                            className="gap-2 cursor-pointer"
                          >
                            <CreditCard className="h-4 w-4 text-primary" />
                            View Bank / UPI Info
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayoutPayment(payment)}
                        className="h-8 px-2.5 text-xs gap-1.5 border-border hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Pay Teacher</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>

    {/* Teacher Bank & Payout Details Dialog */}
    <Dialog open={!!selectedPayoutPayment} onOpenChange={(open) => !open && setSelectedPayoutPayment(null)}>
      <DialogContent className="sm:max-w-[520px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <CreditCard className="h-5 w-5 text-primary" />
            Teacher Payout & Bank Details
          </DialogTitle>
          <DialogDescription>
            Transfer the payout to the teacher's bank/UPI account, then update the payout status below.
          </DialogDescription>
        </DialogHeader>

        {selectedPayoutPayment && (
          <div className="space-y-4 py-2">
            {/* Summary Card */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Teacher</span>
                  <p className="text-base font-semibold text-foreground">{selectedPayoutPayment.teacherId?.name || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">{selectedPayoutPayment.teacherId?.email || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payout Amount</span>
                  <p className="text-2xl font-bold text-emerald-400">
                    ₹{(selectedPayoutPayment.payout?.teacherAmountINR || ((selectedPayoutPayment.payout?.teacherAmountUSD || 0) * 83.33)).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <div className="mt-1 flex justify-end">
                    {getPayoutStatusBadge(selectedPayoutPayment.payout?.status || 'pending')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Course: </span>
                  {getCourseName(selectedPayoutPayment.courseId)}
                </div>
                <div className="text-right">
                  <span className="font-medium text-foreground">Date: </span>
                  {formatDate(selectedPayoutPayment.sessionDate || selectedPayoutPayment.createdAt)}
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" />
                Bank / UPI Account Details
              </h4>

              {selectedPayoutPayment.teacherPayoutInfo &&
                (selectedPayoutPayment.teacherPayoutInfo.bankName ||
                  selectedPayoutPayment.teacherPayoutInfo.accountNumber ||
                  selectedPayoutPayment.teacherPayoutInfo.ifscCode ||
                  selectedPayoutPayment.teacherPayoutInfo.upiId ||
                  selectedPayoutPayment.teacherPayoutInfo.accountHolderName) ? (
                <div className="rounded-lg border border-border bg-card p-3 space-y-2.5 text-sm">
                  {/* Account Holder */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Account Holder:</span>
                    <span className="font-medium text-foreground">
                      {selectedPayoutPayment.teacherPayoutInfo.accountHolderName || selectedPayoutPayment.teacherId?.name || '—'}
                    </span>
                  </div>

                  {/* Bank Name */}
                  {selectedPayoutPayment.teacherPayoutInfo.bankName && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">Bank Name:</span>
                      <span className="font-medium text-foreground">{selectedPayoutPayment.teacherPayoutInfo.bankName}</span>
                    </div>
                  )}

                  {/* Account Number */}
                  {selectedPayoutPayment.teacherPayoutInfo.accountNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">Account Number:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-foreground">
                          {selectedPayoutPayment.teacherPayoutInfo.accountNumber}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={() =>
                            copyToClipboard(selectedPayoutPayment.teacherPayoutInfo?.accountNumber || '', 'acc')
                          }
                        >
                          {copiedField === 'acc' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* IFSC Code */}
                  {selectedPayoutPayment.teacherPayoutInfo.ifscCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">IFSC Code:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-foreground">
                          {selectedPayoutPayment.teacherPayoutInfo.ifscCode}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={() =>
                            copyToClipboard(selectedPayoutPayment.teacherPayoutInfo?.ifscCode || '', 'ifsc')
                          }
                        >
                          {copiedField === 'ifsc' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* UPI ID */}
                  {selectedPayoutPayment.teacherPayoutInfo.upiId && (
                    <div className="flex items-center justify-between border-t border-border/50 pt-2">
                      <span className="text-muted-foreground text-xs">UPI ID:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-primary">
                          {selectedPayoutPayment.teacherPayoutInfo.upiId}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={() =>
                            copyToClipboard(selectedPayoutPayment.teacherPayoutInfo?.upiId || '', 'upi')
                          }
                        >
                          {copiedField === 'upi' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>The teacher has not added their bank or UPI details to their profile yet.</span>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPayoutPayment(null)}>
            Close
          </Button>

          {selectedPayoutPayment && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {selectedPayoutPayment.payout?.status === 'paid' ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updatingPayoutId === selectedPayoutPayment._id}
                  onClick={() => handleUpdatePayoutStatus(selectedPayoutPayment._id, 'pending')}
                  className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 gap-1.5 cursor-pointer"
                >
                  <Clock className="h-4 w-4" />
                  Revert to Pending
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updatingPayoutId === selectedPayoutPayment._id}
                    onClick={() => handleUpdatePayoutStatus(selectedPayoutPayment._id, 'failed')}
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    Mark Failed
                  </Button>
                  <Button
                    size="sm"
                    disabled={updatingPayoutId === selectedPayoutPayment._id}
                    onClick={() => handleUpdatePayoutStatus(selectedPayoutPayment._id, 'paid')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-semibold cursor-pointer"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Paid
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </AdminLayout>
);
};

export default PaymentsPage;
