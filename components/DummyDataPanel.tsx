import React, { useState } from 'react';
import { FileText, Pill, FlaskConical, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dummyDataService } from '../services/dummyDataService';
import { MedicalRecord, Prescription, LabResult } from '../services/dummyDataService';

export const DummyDataPanel: React.FC = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'records' | 'prescriptions' | 'labs'>('records');

  if (!user) return null;

  const isPatient = user.role === 'patient';
  const patientId = isPatient ? user.id : '1'; // For demo, show patient data

  const records = dummyDataService.getMedicalRecords(patientId);
  const prescriptions = dummyDataService.getPrescriptions(patientId);
  const labResults = dummyDataService.getLabResults(patientId);
  const summary = dummyDataService.getPatientSummary(patientId);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ongoing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="fixed bottom-20 right-4 w-80 bg-dark-800 border border-med-900 rounded-xl shadow-2xl z-40">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-dark-900/50 transition rounded-t-xl"
      >
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-med-400" />
          <span className="text-sm font-semibold text-white">Medical Records</span>
          <span className="text-xs text-slate-500">({summary.totalRecords})</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-med-900">
          {/* Tabs */}
          <div className="flex border-b border-med-900">
            <button
              onClick={() => setActiveTab('records')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition ${
                activeTab === 'records'
                  ? 'bg-med-500/10 text-med-400 border-b-2 border-med-500'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Records ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition ${
                activeTab === 'prescriptions'
                  ? 'bg-med-500/10 text-med-400 border-b-2 border-med-500'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Prescriptions ({prescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('labs')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition ${
                activeTab === 'labs'
                  ? 'bg-med-500/10 text-med-400 border-b-2 border-med-500'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              Lab Results ({labResults.length})
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto p-3 space-y-2">
            {activeTab === 'records' && (
              <>
                {records.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No records found</p>
                ) : (
                  records.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 bg-dark-900/50 rounded-lg border border-med-900/30 hover:border-med-500/30 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3 h-3 text-med-400" />
                          <span className="text-xs text-slate-400">{formatDate(record.date)}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1">{record.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{record.description}</p>
                      {record.doctor && (
                        <p className="text-[10px] text-med-400 mt-1">Dr. {record.doctor}</p>
                      )}
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'prescriptions' && (
              <>
                {prescriptions.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No prescriptions found</p>
                ) : (
                  prescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="p-3 bg-dark-900/50 rounded-lg border border-med-900/30"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Pill className="w-3 h-3 text-med-400" />
                        <span className="text-xs text-slate-400">{formatDate(prescription.date)}</span>
                      </div>
                      {prescription.medications.map((med, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                          <p className="text-sm font-semibold text-white">{med.name}</p>
                          <p className="text-xs text-slate-400">
                            {med.dosage} • {med.frequency} • {med.duration}
                          </p>
                        </div>
                      ))}
                      {prescription.notes && (
                        <p className="text-[10px] text-med-400 mt-2 italic">{prescription.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'labs' && (
              <>
                {labResults.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No lab results found</p>
                ) : (
                  labResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 bg-dark-900/50 rounded-lg border border-med-900/30"
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <FlaskConical className="w-3 h-3 text-med-400" />
                        <span className="text-xs text-slate-400">{formatDate(result.date)}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-2">{result.testName}</h4>
                      <div className="space-y-1">
                        {result.results.map((res, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-slate-300">{res.parameter}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">
                                {res.value} {res.unit}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                res.status === 'normal' 
                                  ? 'bg-green-500/20 text-green-400'
                                  : res.status === 'critical'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {res.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


