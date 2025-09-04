'use client';

import { useState, useEffect } from 'react';
import { Wrench, AlertTriangle, Clock, MapPin, Phone, MessageSquare, CheckCircle, X, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { WorkOrder } from '@/types/store';

export default function WorkOrdersPage() {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (user) {
      loadWorkOrders();
    }
  }, [user, filter]);

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? '' : filter === 'active' ? 'submitted,assigned,in_progress,waiting_parts' : filter;
      const url = statusParam ? `/api/work-orders?status=${statusParam}` : '/api/work-orders';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data.workOrders);
      }
    } catch (error) {
      console.error('Error loading work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'assigned':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'in_progress':
        return <Wrench className="w-5 h-5 text-orange-500" />;
      case 'waiting_parts':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'waiting_parts':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancelWorkOrder = async (workOrderId: string) => {
    if (!confirm('Are you sure you want to cancel this work order?')) {
      return;
    }

    try {
      const response = await fetch(`/api/work-orders/${workOrderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (response.ok) {
        // Reload work orders
        loadWorkOrders();
      }
    } catch (error) {
      console.error('Error cancelling work order:', error);
    }
  };

  const filteredWorkOrders = workOrders.filter(workOrder => {
    if (filter === 'active') {
      return ['submitted', 'assigned', 'in_progress', 'waiting_parts'].includes(workOrder.status);
    }
    return filter === 'all' || workOrder.status === filter;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Work Orders</h1>
            <p className="text-gray-600">Please sign in to view your work orders.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">My Work Orders</h1>
              <p className="text-gray-600 mt-2">Track your service requests and repair status</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'completed'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'cancelled'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredWorkOrders.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You don't have any work orders yet."
                : `You don't have any ${filter} work orders.`
              }
            </p>
            <a
              href="/stores"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Find Stores
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredWorkOrders.map((workOrder) => (
              <div
                key={workOrder.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(workOrder.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {workOrder.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}>
                              {workOrder.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(workOrder.priority)}`}>
                              {workOrder.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {workOrder.status === 'submitted' && (
                        <button
                          onClick={() => handleCancelWorkOrder(workOrder.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Type:</span> {workOrder.type.charAt(0).toUpperCase() + workOrder.type.slice(1)}
                        </div>
                        {workOrder.service && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Service:</span> {workOrder.service.name}
                          </div>
                        )}
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Submitted:</span> {formatDate(workOrder.createdAt)}
                        </div>
                        {workOrder.estimatedCompletion && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Estimated Completion:</span> {formatDate(workOrder.estimatedCompletion)}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{workOrder.store?.name || 'Store'}</span>
                        </div>
                        {workOrder.estimatedCost && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Estimated Cost:</span> ${workOrder.estimatedCost}
                          </div>
                        )}
                        {workOrder.actualCost && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Actual Cost:</span> ${workOrder.actualCost}
                          </div>
                        )}
                        {workOrder.assignedTechnician && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Technician:</span> {workOrder.assignedTechnician}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{workOrder.description}</p>
                    </div>

                    {/* Customer Notes */}
                    {workOrder.customerNotes && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Your Notes</h4>
                        <p className="text-sm text-gray-600">{workOrder.customerNotes}</p>
                      </div>
                    )}

                    {/* Technician Notes */}
                    {workOrder.technicianNotes && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Technician Notes</h4>
                        <p className="text-sm text-gray-600">{workOrder.technicianNotes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => window.location.href = `tel:${workOrder.store?.phone || ''}`}
                        className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Store
                      </button>

                      <button
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${workOrder.store?.latitude},${workOrder.store?.longitude}`;
                          window.open(url, '_blank');
                        }}
                        className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Get Directions
                      </button>

                      <button
                        onClick={() => {
                          // This would open a chat or contact form
                          alert('Contact support feature coming soon');
                        }}
                        className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
