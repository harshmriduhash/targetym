'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'

type RequestStatus = 'approved' | 'rejected' | 'pending'

interface Request {
  id: string
  type: string
  status: RequestStatus
  date: Date
  description?: string
}

interface RequestsTableProps {
  requests?: Request[]
}

const mockRequests: Request[] = [
  {
    id: '1',
    type: 'New Laptop Request',
    status: 'approved',
    date: new Date('2023-10-15'),
    description: 'MacBook Pro M3'
  },
  {
    id: '2',
    type: 'Leave Request',
    status: 'approved',
    date: new Date('2023-10-12'),
    description: '3 days vacation'
  },
  {
    id: '3',
    type: 'Salary Request',
    status: 'pending',
    date: new Date('2023-10-20'),
    description: 'Salary adjustment review'
  },
  {
    id: '4',
    type: 'Leave Request',
    status: 'rejected',
    date: new Date('2023-10-18'),
    description: 'Emergency leave'
  },
  {
    id: '5',
    type: 'Leavers Request',
    status: 'pending',
    date: new Date('2023-10-22'),
    description: 'Equipment return'
  },
]

function getStatusBadge(status: RequestStatus) {
  const variants = {
    approved: 'bg-green-100 text-green-800 hover:bg-green-100',
    rejected: 'bg-red-100 text-red-800 hover:bg-red-100',
    pending: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  }

  const labels = {
    approved: 'Approved',
    rejected: 'Rejected',
    pending: 'Pending',
  }

  return (
    <Badge variant="secondary" className={variants[status]}>
      {labels[status]}
    </Badge>
  )
}

export function RequestsTable({ requests = mockRequests }: RequestsTableProps) {
  const filterRequests = (status: RequestStatus) =>
    requests.filter((req) => req.status === status)

  const RequestsList = ({ status }: { status: RequestStatus }) => {
    const filteredRequests = filterRequests(status)

    if (filteredRequests.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No {status} requests
        </div>
      )
    }

    return (
      <div className="space-y-1.5 sm:space-y-2">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs sm:text-sm truncate">{request.type}</p>
              {request.description && (
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">
                  {request.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {getStatusBadge(request.status)}
              <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                {format(request.date, 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto p-0.5 sm:p-1">
            <TabsTrigger value="all" className="text-[10px] sm:text-xs px-1 sm:px-2 py-1 sm:py-1.5">
              All
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-[10px] sm:text-xs px-1 sm:px-2 py-1 sm:py-1.5">
              <span className="hidden sm:inline">Approved</span>
              <span className="sm:hidden">App.</span>
              <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full p-0 flex items-center justify-center text-[9px] sm:text-[10px]">
                {filterRequests('approved').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-[10px] sm:text-xs px-1 sm:px-2 py-1 sm:py-1.5">
              <span className="hidden sm:inline">Rejected</span>
              <span className="sm:hidden">Rej.</span>
              <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full p-0 flex items-center justify-center text-[9px] sm:text-[10px]">
                {filterRequests('rejected').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-[10px] sm:text-xs px-1 sm:px-2 py-1 sm:py-1.5">
              <span className="hidden sm:inline">Pending</span>
              <span className="sm:hidden">Pend.</span>
              <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full p-0 flex items-center justify-center text-[9px] sm:text-[10px]">
                {filterRequests('pending').length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-1.5 sm:mt-2">
            <div className="space-y-1.5 sm:space-y-2">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm truncate">{request.type}</p>
                    {request.description && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">
                        {request.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {getStatusBadge(request.status)}
                    <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                      {format(request.date, 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-1.5 sm:mt-2">
            <RequestsList status="approved" />
          </TabsContent>

          <TabsContent value="rejected" className="mt-1.5 sm:mt-2">
            <RequestsList status="rejected" />
          </TabsContent>

          <TabsContent value="pending" className="mt-1.5 sm:mt-2">
            <RequestsList status="pending" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
