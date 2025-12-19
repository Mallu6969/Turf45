import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { usePOS, Station } from '@/context/POSContext';
import StationInfo from '@/components/station/StationInfo';
import StationTimer from '@/components/station/StationTimer';
import StationActions from '@/components/station/StationActions';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, Tag, Trophy, Target } from 'lucide-react';
import EditStationDialog from './EditStationDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StationCardProps {
  station: Station;
}

const StationCard: React.FC<StationCardProps> = ({ station }) => {
  const { customers, startSession, endSession, deleteStation, updateStation } = usePOS();
  const isTurf = station.type === 'turf';
  const isPickleball = station.type === 'pickleball';
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const getCustomer = (id: string) => {
    return customers.find(c => c.id === id);
  };

  const customer = station.currentSession 
    ? getCustomer(station.currentSession.customerId)
    : null;
    
  const customerName = customer ? customer.name : 'Unknown Customer';
  
  const session = station.currentSession;
  const hasCoupon = session?.couponCode;
  const discountedRate = session?.hourlyRate || station.hourlyRate;
  const originalRate = session?.originalRate || station.hourlyRate;
  const isDiscounted = hasCoupon && discountedRate !== originalRate;
  const currentSport = station.currentSport || session?.sport;
    
  const handleDeleteStation = async () => {
    await deleteStation(station.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditDialogOpen(true);
  };

  return (
    <>
      <Card 
        className={`
          relative overflow-hidden h-full transition-all duration-500
          ${station.isOccupied 
            ? 'border-red-500/50 shadow-lg shadow-red-500/20' 
            : isTurf 
              ? 'border-green-500/50 shadow-lg shadow-green-500/20 hover:shadow-green-500/40' 
              : 'border-blue-500/50 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40'
          }
          hover:scale-[1.02] cursor-pointer
        `}
      >
        {/* Realistic Court Background */}
        <div className="absolute inset-0 overflow-hidden">
          {isTurf ? (
            /* Football/Cricket Turf Ground */
            <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-700 to-green-900">
              {/* Grass texture effect */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 100, 0, 0.3) 2px,
                  rgba(0, 100, 0, 0.3) 4px
                )`
              }}></div>
              
              {/* Football field lines */}
              <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 60" preserveAspectRatio="none">
                {/* Outer boundary */}
                <rect x="5" y="5" width="90" height="50" fill="none" stroke="white" strokeWidth="0.5"/>
                
                {/* Center line */}
                <line x1="50" y1="5" x2="50" y2="55" stroke="white" strokeWidth="0.5"/>
                
                {/* Center circle */}
                <circle cx="50" cy="30" r="8" fill="none" stroke="white" strokeWidth="0.5"/>
                <circle cx="50" cy="30" r="0.8" fill="white"/>
                
                {/* Goal areas */}
                <rect x="5" y="18" width="8" height="24" fill="none" stroke="white" strokeWidth="0.5"/>
                <rect x="87" y="18" width="8" height="24" fill="none" stroke="white" strokeWidth="0.5"/>
                
                {/* Penalty areas */}
                <rect x="5" y="12" width="15" height="36" fill="none" stroke="white" strokeWidth="0.5"/>
                <rect x="80" y="12" width="15" height="36" fill="none" stroke="white" strokeWidth="0.5"/>
              </svg>
              
              {/* Animated grass sway */}
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
            </div>
          ) : (
            /* Pickleball Court */
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900">
              {/* Court surface texture */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(255, 255, 255, 0.05) 10px,
                  rgba(255, 255, 255, 0.05) 11px
                )`
              }}></div>
              
              {/* Pickleball court lines */}
              <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 60" preserveAspectRatio="none">
                {/* Outer boundary */}
                <rect x="15" y="5" width="70" height="50" fill="none" stroke="white" strokeWidth="0.8"/>
                
                {/* Center line */}
                <line x1="50" y1="5" x2="50" y2="55" stroke="white" strokeWidth="0.6"/>
                
                {/* Service lines */}
                <line x1="15" y1="18" x2="85" y2="18" stroke="white" strokeWidth="0.6"/>
                <line x1="15" y1="42" x2="85" y2="42" stroke="white" strokeWidth="0.6"/>
                
                {/* Kitchen (non-volley zone) */}
                <line x1="15" y1="23" x2="85" y2="23" stroke="white" strokeWidth="0.6" strokeDasharray="2,2"/>
                <line x1="15" y1="37" x2="85" y2="37" stroke="white" strokeWidth="0.6" strokeDasharray="2,2"/>
                
                {/* Center service lines */}
                <line x1="50" y1="18" x2="50" y2="42" stroke="white" strokeWidth="0.6"/>
              </svg>
              
              {/* Animated court shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
            </div>
          )}
          
          {/* Dark overlay for occupied courts */}
          {station.isOccupied && (
            <div className="absolute inset-0 bg-black/40"></div>
          )}
        </div>

        {/* Coupon Badge */}
        {station.isOccupied && hasCoupon && (
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
            <Tag className="h-3 w-3" />
            {session.couponCode}
          </div>
        )}

        {/* Sport Badge for Turf */}
        {isTurf && currentSport && (
          <div className="absolute top-3 left-3 z-30 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
            {currentSport === 'football' ? '⚽ Football' : '🏏 Cricket'}
          </div>
        )}

        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isTurf ? (
                <div className="w-10 h-10 rounded-full bg-green-500/20 backdrop-blur-sm flex items-center justify-center border-2 border-green-500">
                  <Trophy className="h-5 w-5 text-green-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500/20 backdrop-blur-sm flex items-center justify-center border-2 border-blue-500">
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white drop-shadow-lg">{station.name}</h3>
                <p className="text-xs text-white/80">
                  {isTurf ? 'FIFA-Approved Turf' : 'Indoor Court'}
                </p>
              </div>
            </div>
            
            {/* Status badge */}
            <div className={`
              px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border-2
              ${station.isOccupied 
                ? 'bg-red-500/30 text-red-100 border-red-400 animate-pulse' 
                : 'bg-green-500/30 text-green-100 border-green-400'
              }
            `}>
              {station.isOccupied ? '🔴 IN USE' : '🟢 AVAILABLE'}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 relative z-10">
          {/* Session Info or Rate */}
          {station.isOccupied && station.currentSession ? (
            <div className="bg-black/50 backdrop-blur-md rounded-lg p-3 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-sm">Playing:</span>
                <span className="text-white font-semibold">{customerName}</span>
              </div>
              
              <StationTimer session={station.currentSession} />
              
              {isDiscounted && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <Tag className="h-3 w-3 text-orange-400" />
                  <span className="text-white/70">Rate:</span>
                  <span className="line-through text-white/50">₹{originalRate}</span>
                  <span className="text-orange-400 font-bold">₹{discountedRate}/hr</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <span className="text-white/90 font-medium">Hourly Rate</span>
                <span className="text-2xl font-bold text-white">₹{station.hourlyRate}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
              <Button 
                variant="ghost" 
              size="sm"
                onClick={handleEditClick}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
              >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
              </Button>
            
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                  size="sm"
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-400/30 backdrop-blur-sm"
                    disabled={station.isOccupied}
                  >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                  </Button>
                </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                  <AlertDialogTitle>Delete Court?</AlertDialogTitle>
                    <AlertDialogDescription>
                    Are you sure you want to delete "{station.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteStation}
                    className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </div>
        </CardContent>

        <CardFooter className="pt-0 relative z-10">
          <StationActions 
            station={station}
            customers={customers}
            onStartSession={startSession}
            onEndSession={endSession}
          />
        </CardFooter>
      </Card>

      <EditStationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        station={station}
        onSave={updateStation}
      />
    </>
  );
};

export default StationCard;
