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
import { Search, Download, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  teacherId: {
    _id: string;
    name: string;
    email: string;
  };
  courseId: {
    _id: string;
    name: string | { en: string };
  };
  sessionDate: string;
  duration: number;
  pricingSnapshot: {
    baseAmountUSD: number;
    platformFeeUSD: number;
    studentPaid: {
      amount: number;
      currency: string;
    };
  };
  payout: {
    teacherAmountUSD: number;
    teacherCurrency: string;
    status: 'pending' | 'paid' | 'failed';
  };
  payment: {
    stripePaymentIntentId: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
  };
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api';

const getToken = () => localStorage.getItem('admin-auth-token') || sessionStorage.getItem('admin-auth-token');

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<string>('all');
  const { toast } = useToast();

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
    const totalRevenue = paymentsData.reduce((sum, p) => sum + (p.pricingSnapshot?.studentPaid?.amount || 0), 0);
    const totalPlatformFee = paymentsData.reduce((sum, p) => sum + (p.pricingSnapshot?.platformFeeUSD || 0), 0);
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
      filtered = filtered.filter(p => p.payment?.status === paymentStatusFilter);
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
        p.payment?.stripePaymentIntentId?.toLowerCase().includes(query)
      );
    }

    setFilteredPayments(filtered);
  };

  const getPaymentStatusBadge = (status: string) => {
    const config = {
      paid: { label: 'Paid', className: 'bg-success/20 text-success border-success/30' },
      pending: { label: 'Pending', className: 'bg-warning/20 text-warning border-warning/30' },
      failed: { label: 'Failed', className: 'bg-destructive/20 text-destructive border-destructive/30' },
      refunded: { label: 'Refunded', className: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
    };
    const { label, className } = config[status as keyof typeof config] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
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
                  ${stats.totalRevenue.toFixed(2)}
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
                  ${stats.totalPlatformFee.toFixed(2)}
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
                  ${stats.pendingPayouts.toFixed(2)}
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
                  ${stats.completedPayouts.toFixed(2)}
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
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
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
                  <TableHead>Amount</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Teacher Payout</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Payout Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-muted-foreground">Loading payments...</div>
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-muted-foreground">No payments found</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="font-medium">
                        {formatDate(payment.sessionDate)}
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
                        <div className="font-medium">
                          {formatCurrency(
                            payment.pricingSnapshot?.studentPaid?.amount || 0,
                            payment.pricingSnapshot?.studentPaid?.currency || 'INR'
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground">
                          ${(payment.pricingSnapshot?.platformFeeUSD || 0).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ${(payment.payout?.teacherAmountUSD || 0).toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(payment.payment?.status || 'pending')}
                      </TableCell>
                      <TableCell>
                        {getPayoutStatusBadge(payment.payout?.status || 'pending')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PaymentsPage;
