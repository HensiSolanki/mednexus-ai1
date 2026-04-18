import { User } from '../types/auth';

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: Date;
  type: 'consultation' | 'lab_result' | 'prescription' | 'diagnosis' | 'vaccination';
  title: string;
  description: string;
  doctor?: string;
  status: 'active' | 'resolved' | 'ongoing';
}

export interface Prescription {
  id: string;
  patientId: string;
  date: Date;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  doctor: string;
  notes?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  date: Date;
  testName: string;
  results: {
    parameter: string;
    value: string;
    unit: string;
    normalRange: string;
    status: 'normal' | 'abnormal' | 'critical';
  }[];
  doctor: string;
  notes?: string;
}

// Dummy medical records
const DUMMY_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: '1',
    patientId: '1',
    date: new Date('2024-03-15'),
    type: 'consultation',
    title: 'Annual Physical Examination',
    description: 'Routine checkup. Patient is in good health. Blood pressure: 120/80. Heart rate: 72 bpm.',
    doctor: 'Dr. Sarah Smith',
    status: 'resolved',
  },
  {
    id: '2',
    patientId: '1',
    date: new Date('2024-02-20'),
    type: 'prescription',
    title: 'Antibiotic Prescription',
    description: 'Prescribed Amoxicillin 500mg for bacterial infection. Take twice daily for 7 days.',
    doctor: 'Dr. Sarah Smith',
    status: 'resolved',
  },
  {
    id: '3',
    patientId: '1',
    date: new Date('2024-01-10'),
    type: 'lab_result',
    title: 'Complete Blood Count (CBC)',
    description: 'All values within normal range. Hemoglobin: 14.2 g/dL, White blood cells: 6.5 K/μL.',
    doctor: 'Dr. Sarah Smith',
    status: 'resolved',
  },
  {
    id: '4',
    patientId: '4',
    date: new Date('2024-03-20'),
    type: 'consultation',
    title: 'Follow-up for Hypertension',
    description: 'Blood pressure monitoring. Current reading: 135/85. Recommended lifestyle changes.',
    doctor: 'Dr. Sarah Smith',
    status: 'ongoing',
  },
  {
    id: '5',
    patientId: '4',
    date: new Date('2024-03-01'),
    type: 'vaccination',
    title: 'Flu Vaccination',
    description: 'Received annual flu vaccine. No adverse reactions observed.',
    doctor: 'Dr. Sarah Smith',
    status: 'resolved',
  },
];

const DUMMY_PRESCRIPTIONS: Prescription[] = [
  {
    id: '1',
    patientId: '1',
    date: new Date('2024-02-20'),
    medications: [
      {
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Twice daily',
        duration: '7 days',
      },
    ],
    doctor: 'Dr. Sarah Smith',
    notes: 'Take with food to reduce stomach upset.',
  },
  {
    id: '2',
    patientId: '4',
    date: new Date('2024-03-15'),
    medications: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: 'Ongoing',
      },
      {
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'Once daily',
        duration: 'Ongoing',
      },
    ],
    doctor: 'Dr. Sarah Smith',
    notes: 'Monitor blood pressure regularly.',
  },
];

const DUMMY_LAB_RESULTS: LabResult[] = [
  {
    id: '1',
    patientId: '1',
    date: new Date('2024-01-10'),
    testName: 'Complete Blood Count (CBC)',
    results: [
      {
        parameter: 'Hemoglobin',
        value: '14.2',
        unit: 'g/dL',
        normalRange: '13.5-17.5',
        status: 'normal',
      },
      {
        parameter: 'White Blood Cells',
        value: '6.5',
        unit: 'K/μL',
        normalRange: '4.5-11.0',
        status: 'normal',
      },
      {
        parameter: 'Platelets',
        value: '250',
        unit: 'K/μL',
        normalRange: '150-450',
        status: 'normal',
      },
    ],
    doctor: 'Dr. Sarah Smith',
    notes: 'All values within normal limits.',
  },
  {
    id: '2',
    patientId: '4',
    date: new Date('2024-03-01'),
    testName: 'Lipid Panel',
    results: [
      {
        parameter: 'Total Cholesterol',
        value: '220',
        unit: 'mg/dL',
        normalRange: '<200',
        status: 'abnormal',
      },
      {
        parameter: 'LDL Cholesterol',
        value: '145',
        unit: 'mg/dL',
        normalRange: '<100',
        status: 'abnormal',
      },
      {
        parameter: 'HDL Cholesterol',
        value: '55',
        unit: 'mg/dL',
        normalRange: '>40',
        status: 'normal',
      },
      {
        parameter: 'Triglycerides',
        value: '180',
        unit: 'mg/dL',
        normalRange: '<150',
        status: 'abnormal',
      },
    ],
    doctor: 'Dr. Sarah Smith',
    notes: 'Elevated cholesterol levels. Dietary modifications recommended.',
  },
];

export const dummyDataService = {
  // Get medical records for a patient
  getMedicalRecords: (patientId: string): MedicalRecord[] => {
    return DUMMY_MEDICAL_RECORDS.filter(record => record.patientId === patientId);
  },

  // Get all medical records (for doctors/admins)
  getAllMedicalRecords: (): MedicalRecord[] => {
    return DUMMY_MEDICAL_RECORDS;
  },

  // Get prescriptions for a patient
  getPrescriptions: (patientId: string): Prescription[] => {
    return DUMMY_PRESCRIPTIONS.filter(prescription => prescription.patientId === patientId);
  },

  // Get lab results for a patient
  getLabResults: (patientId: string): LabResult[] => {
    return DUMMY_LAB_RESULTS.filter(result => result.patientId === patientId);
  },

  // Get patient summary
  getPatientSummary: (patientId: string) => {
    const records = dummyDataService.getMedicalRecords(patientId);
    const prescriptions = dummyDataService.getPrescriptions(patientId);
    const labResults = dummyDataService.getLabResults(patientId);

    return {
      totalRecords: records.length,
      activeConditions: records.filter(r => r.status === 'ongoing').length,
      recentConsultations: records.filter(r => r.type === 'consultation').slice(0, 3),
      activePrescriptions: prescriptions.filter(p => 
        p.medications.some(m => m.duration === 'Ongoing')
      ),
      recentLabResults: labResults.slice(0, 2),
    };
  },

  // Get all patients (for doctors/admins)
  getAllPatients: (): User[] => {
    return [
      {
        id: '1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'patient',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: '4',
        email: 'jane.patient@example.com',
        name: 'Jane Patient',
        role: 'patient',
        createdAt: new Date('2024-02-01'),
      },
    ];
  },
};


