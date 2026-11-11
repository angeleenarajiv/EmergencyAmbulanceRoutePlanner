import React, { useState, useMemo, useEffect } from 'react';
import {
  INITIAL_NODES,
  INITIAL_EDGES,
  INITIAL_INCIDENTS,
  INITIAL_AMBULANCES,
  GraphNode,
  GraphEdge,
  IncidentReport,
  AmbulanceUnit,
  DispatchLog,
  DiversionStatus
} from './data/mockData';
import {
  findOptimalAmbulanceFromFleet,
  findOptimalReceivingHospital,
  runDijkstra,
  PathResult
} from './utils/graphAlgorithms';
import { sirenAudio } from './utils/sirenSound';
import { UserRole, UserProfile, AdminNotification } from './types';
import { requestAiIncidentVerification } from './utils/aiVerification';
import { EmergencyToast } from './components/AdminNotificationToast';
import { useTheme } from './context/ThemeContext';
import { Header } from './components/Header';
import { RoleSelectScreen } from './components/RoleSelectScreen';
import { CitizenModule } from './components/CitizenModule';
import { HospitalModule } from './components/HospitalModule';
import { AdminModule } from './components/AdminModule';

import { ReportAccidentModal } from './components/ReportAccidentModal';
import { ResearchModal } from './components/ResearchModal';
import { PhotoLightboxModal } from './components/PhotoLightboxModal';
import { Dial911Modal } from './components/Dial911Modal';
import { LoginModal } from './components/LoginModal';
import { GeminiChatbotModal } from './components/GeminiChatbotModal';
import { Sparkles } from 'lucide-react';

export default function App() {
  const { isDark } = useTheme();

  // First show Sign In page to choose role:
  // When isAuthenticated is false, the app displays RoleSelectScreen.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<UserProfile>({
    role: 'citizen',
    name: 'George Mathew',
    email: 'george.mathew@keralaems.org',
    badge: 'Citizen Bystander'
  });

  const [managedHospitalId, setManagedHospitalId] = useState<string>('medical_trust');

  // Core Simulation State
  const [nodes, setNodes] = useState<Record<string, GraphNode>>(INITIAL_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_EDGES);
  const [ambulances, setAmbulances] = useState<AmbulanceUnit[]>(INITIAL_AMBULANCES);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [activeIncidentId, setActiveIncidentId] = useState<string>('ACC-2026-EKM01');

  // Automated Ambulance Pipeline Updation State
  const [isAutoPipelineActive, setIsAutoPipelineActive] = useState<boolean>(true);
  const [pipelineCountdown, setPipelineCountdown] = useState<number>(10);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
  const [isDialModalOpen, setIsDialModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  // Admin Emergency Notifications State (AI Auto-Verified Incident Alerts)
  const [notifications, setNotifications] = useState<AdminNotification[]>([
    {
      id: 'notif-init-1',
      incidentId: 'ACC-2026-EKM01',
      incidentCode: 'ACC-2026-EKM01',
      title: 'Vytilla Mobility Hub Underpass Collision',
      location: 'Vytilla Junction near Metro Pillar 842',
      severity: 'Code Red • Critical',
      confidence: 98.7,
      timestamp: '01:03 pm',
      isRead: false,
      ambulanceName: 'Highway Bravo 2 (KL-07-EMS-1082)',
      hospitalName: 'Medical Trust Hospital',
      routeEtaMinutes: 2.8
    }
  ]);
  const [activeToast, setActiveToast] = useState<AdminNotification | null>(null);

  // Current active incident
  const activeIncident = useMemo(() => {
    return incidents.find((inc) => inc.id === activeIncidentId) || incidents[0];
  }, [incidents, activeIncidentId]);

  // Compute live estimated metrics using Dijkstra
  const liveRouteMetrics = useMemo(() => {
    if (!activeIncident) return { ambulanceMinutes: 4.8, hospitalKm: 4.5 };

    const assignedAmb = ambulances.find((a) => a.id === activeIncident.assignedAmbulanceId);
    const originNodeId = assignedAmb ? assignedAmb.currentLocationNodeId : 'station_vytilla';

    const ambResult: PathResult = runDijkstra(
      originNodeId,
      activeIncident.nodeId,
      nodes,
      edges
    );
    const hospResult: PathResult = runDijkstra(
      activeIncident.nodeId,
      activeIncident.targetHospitalId || 'medical_trust',
      nodes,
      edges
    );

    return {
      ambulanceMinutes: ambResult.estimatedMinutes,
      hospitalKm: hospResult.totalDistanceKm
    };
  }, [activeIncident, ambulances, nodes, edges]);

  // Handlers for Authentication & Role Selection
  const handleSelectRoleAndLogin = (profile: UserProfile) => {
    setCurrentUser(profile);
    setIsAuthenticated(true);
    if (profile.hospitalId) {
      setManagedHospitalId(profile.hospitalId);
    }
    sirenAudio.playBeep(980, 150);
  };

  const handleRoleChange = (role: UserRole) => {
    sirenAudio.playBeep(840, 100);

    if (role === 'citizen') {
      setCurrentUser({
        role: 'citizen',
        name: 'George Mathew',
        email: 'george.mathew@keralaems.org',
        badge: 'Citizen Bystander'
      });
    } else if (role === 'admin') {
      setCurrentUser({
        role: 'admin',
        name: 'Officer Sarah Chen',
        email: 'dispatch.chief@resqpath.gov.in',
        badge: 'Chief EMS Dispatcher (Kerala 108 CAD)'
      });
    } else {
      const hosp = nodes[managedHospitalId];
      setCurrentUser({
        role: 'hospital',
        name: 'Dr. Mathew Kurian',
        email: `trauma.desk@${managedHospitalId}.resqpath.gov.in`,
        badge: `Trauma Medical Officer · ${hosp ? hosp.name.split(',')[0] : 'Hospital'}`,
        hospitalId: managedHospitalId
      });
    }
  };

  // Admin Action: Click "View on Map" from Notifications or Incident Cards
  const handleViewOnMap = (incidentId: string) => {
    setActiveIncidentId(incidentId);

    // If currently in Citizen or Hospital module, automatically switch to CAD Admin console
    if (currentUser.role !== 'admin') {
      setCurrentUser({
        role: 'admin',
        name: 'Officer Sarah Chen',
        email: 'dispatch.chief@resqpath.gov.in',
        badge: 'Chief EMS Dispatcher (Kerala 108 CAD)'
      });
    }

    // Mark as read in notifications
    setNotifications((prev) =>
      prev.map((n) => (n.incidentId === incidentId ? { ...n, isRead: true } : n))
    );
    setActiveToast(null);

    // Smooth scroll down to the CAD map with visual spotlight highlight
    setTimeout(() => {
      const mapElement = document.getElementById('cad-map-section');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth' });
        mapElement.classList.add('ring-4', 'ring-cyan-400');
        setTimeout(() => mapElement.classList.remove('ring-4', 'ring-cyan-400'), 2500);
      }
    }, 150);
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // 1. AI Auto-Verify Incident & Run Dijkstra Shortest Path Solver
  const handleVerifyAndSolveDijkstra = async (incidentId: string) => {
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;

    sirenAudio.playBeep(1100, 200);

    // Run Dijkstra across all fleet ambulances from their CURRENT real location to find closest
    const { ambulance: optimalAmbulance, route: ambRoute } = findOptimalAmbulanceFromFleet(
      inc.nodeId,
      ambulances,
      nodes,
      edges
    );

    // Run Dijkstra to find optimal receiving hospital with available ICU capacity
    const { hospitalId: optimalHospitalId, route: hospRoute } = findOptimalReceivingHospital(
      inc.nodeId,
      nodes,
      edges
    );

    const receivingHospital = nodes[optimalHospitalId];
    const ambStartNode = nodes[optimalAmbulance.currentLocationNodeId];

    // Request AI verification details
    const aiVerification = await requestAiIncidentVerification({
      title: inc.title,
      locationDetails: inc.locationDetails,
      severity: inc.severity,
      casualties: inc.casualties,
      vehiclesInvolved: inc.vehiclesInvolved,
      sceneDocumentsCount: inc.sceneDocuments?.length || 1
    });

    // Create verification CAD log
    const verificationLog: DispatchLog = {
      id: `cad-verify-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
      title: 'Incident Auto-Verified by Gemini AI CAD Engine',
      description: `AI verified ${inc.code} (${aiVerification.confidenceScore}% confidence). Dijkstra solver allocated closest unit ${optimalAmbulance.name} (${ambRoute.totalDistanceKm} km, ETA ~${ambRoute.estimatedMinutes}m from ${ambStartNode?.shortName}) and destination ${receivingHospital?.name.split(',')[0]} (${hospRoute.totalDistanceKm} km, ${receivingHospital?.icuAvailable} ICU beds open).`,
      author: 'Gemini 3.8 Flash CAD Engine'
    };

    // Update incident status to verified and en route
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === incidentId
          ? {
              ...item,
              isVerifiedByAdmin: true,
              isVerifiedByAi: true,
              aiVerification,
              assignedAmbulanceId: optimalAmbulance.id,
              targetHospitalId: optimalHospitalId,
              statusStep: Math.max(3, item.statusStep), // Step 3: Ambulance En Route
              logs: [verificationLog, ...item.logs]
            }
          : item
      )
    );

    // Update fleet status: Mark optimal ambulance as Active En Route
    setAmbulances((prev) =>
      prev.map((a) =>
        a.id === optimalAmbulance.id
          ? {
              ...a,
              status: 'ACTIVE_EN_ROUTE',
              assignedIncidentId: incidentId
            }
          : a
      )
    );

    // Emit notification to Admin
    const newNotif: AdminNotification = {
      id: `notif-${Date.now()}`,
      incidentId: inc.id,
      incidentCode: inc.code,
      title: inc.title,
      location: inc.locationDetails,
      severity: inc.severity,
      confidence: aiVerification.confidenceScore,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
      isRead: false,
      ambulanceName: optimalAmbulance.name,
      hospitalName: receivingHospital?.name.split(',')[0],
      routeEtaMinutes: ambRoute.estimatedMinutes
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);
  };

  // 2. ADMIN ACTION: Relocate Ambulance (Updates location & recalculates weighted graph)
  const handleRelocateAmbulance = (ambulanceId: string, newNodeId: string) => {
    sirenAudio.playBeep(780, 80);
    const targetNode = nodes[newNodeId];

    setAmbulances((prev) =>
      prev.map((a) => {
        if (a.id !== ambulanceId) return a;
        return {
          ...a,
          currentLocationNodeId: newNodeId
        };
      })
    );

    const relocLog: DispatchLog = {
      id: `reloc-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
      title: 'Ambulance Repositioned in Network',
      description: `Ambulance unit repositioned to ${targetNode?.name || newNodeId}. Dijkstra origin dynamically re-anchored.`,
      author: 'CAD Fleet Control'
    };

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === activeIncident.id
          ? {
              ...inc,
              logs: [relocLog, ...inc.logs]
            }
          : inc
      )
    );
  };

  // 3. ADMIN ACTION: Manually Assign Ambulance
  const handleAssignAmbulance = (incidentId: string, ambulanceId: string) => {
    const selectedAmb = ambulances.find((a) => a.id === ambulanceId);
    if (!selectedAmb) return;

    sirenAudio.playBeep(920, 100);

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              assignedAmbulanceId: ambulanceId,
              logs: [
                {
                  id: `reassign-${Date.now()}`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
                  title: `Ambulance Reassigned: ${selectedAmb.name}`,
                  description: `CAD supervisor assigned unit ${selectedAmb.code} (${selectedAmb.level}) to this incident.`,
                  author: 'Officer Sarah Chen'
                },
                ...inc.logs
              ]
            }
          : inc
      )
    );

    setAmbulances((prev) =>
      prev.map((a) =>
        a.id === ambulanceId
          ? { ...a, status: 'ACTIVE_EN_ROUTE', assignedIncidentId: incidentId }
          : a
      )
    );
  };

  // 3.5. ADMIN ACTION: Toggle Ambulance Status between Free (IDLE) and Not Free (ACTIVE_EN_ROUTE)
  const handleToggleAmbulanceStatus = (ambulanceId: string) => {
    sirenAudio.playBeep(780, 100);
    setAmbulances((prev) =>
      prev.map((a) => {
        if (a.id !== ambulanceId) return a;
        const isFree = a.status === 'IDLE';
        return {
          ...a,
          status: isFree ? 'ACTIVE_EN_ROUTE' : 'IDLE',
          assignedIncidentId: isFree ? (a.assignedIncidentId || activeIncidentId) : undefined
        };
      })
    );
  };

  // 4. ADMIN & HOSPITAL ACTION: Toggle Hospital Status (Free / Open vs Full / Divert)
  const handleToggleHospitalStatus = (hospitalId: string, newStatus: DiversionStatus) => {
    sirenAudio.playBeep(850, 100);

    const updatedNodes = {
      ...nodes,
      [hospitalId]: {
        ...nodes[hospitalId],
        diversionStatus: newStatus,
        lastUpdatedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };
    setNodes(updatedNodes);

    // If the changed hospital was the active incident's receiving hospital and is now diverted,
    // re-run Dijkstra to auto-route to the next best available hospital!
    if (activeIncident && activeIncident.targetHospitalId === hospitalId && newStatus === 'divert') {
      const { hospitalId: newOptimalHospId } = findOptimalReceivingHospital(
        activeIncident.nodeId,
        updatedNodes,
        edges
      );

      const newHosp = updatedNodes[newOptimalHospId];
      const divertedHosp = updatedNodes[hospitalId];

      const rerouteLog: DispatchLog = {
        id: `reroute-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
        title: `Auto-Reroute: ${divertedHosp?.name.split(',')[0]} Marked Full`,
        description: `Hospital diversion triggered dynamic Dijkstra rerouting. Patient transferred to ${newHosp?.name.split(',')[0]} (${newHosp?.icuAvailable} ICU beds open).`,
        author: 'ResQPath Dijkstra Engine'
      };

      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === activeIncident.id
            ? {
                ...inc,
                targetHospitalId: newOptimalHospId,
                logs: [rerouteLog, ...inc.logs]
              }
            : inc
        )
      );
    }
  };

  // 5. HOSPITAL ACTION: Update Hospital Capacity & Availability (No OSM)
  const handleUpdateHospitalCapacity = (
    hospId: string,
    updates: {
      freeBeds: number;
      totalBeds: number;
      icuAvailable: number;
      diversionStatus: DiversionStatus;
      ventilatorsAvailable?: number;
      oxygenReservePercent?: number;
    }
  ) => {
    const updatedNodes = {
      ...nodes,
      [hospId]: {
        ...nodes[hospId],
        beds: { free: updates.freeBeds, total: updates.totalBeds },
        icuAvailable: updates.icuAvailable,
        diversionStatus: updates.diversionStatus,
        ventilatorsAvailable: updates.ventilatorsAvailable,
        oxygenReservePercent: updates.oxygenReservePercent,
        lastUpdatedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };
    setNodes(updatedNodes);

    // Check if Dijkstra recommends re-routing for the active incident
    const { hospitalId: newOptimalHospitalId } = findOptimalReceivingHospital(
      activeIncident.nodeId,
      updatedNodes,
      edges
    );

    if (newOptimalHospitalId !== activeIncident.targetHospitalId) {
      const targetHospital = updatedNodes[newOptimalHospitalId];
      const previousHospital = updatedNodes[activeIncident.targetHospitalId];

      const rerouteLog: DispatchLog = {
        id: `reroute-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
        title: `Dijkstra Trauma Reroute: ${targetHospital.name.split(',')[0]} Assigned`,
        description: `Capacity update at ${previousHospital?.name.split(',')[0]} triggered auto-reroute to ${targetHospital?.name.split(',')[0]} with ${updates.icuAvailable} verified ICU beds.`,
        author: 'ResQPath Dijkstra Engine'
      };

      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === activeIncident.id
            ? {
                ...inc,
                targetHospitalId: newOptimalHospitalId,
                logs: [rerouteLog, ...inc.logs]
              }
            : inc
        )
      );
    }
  };

  // 6. HOSPITAL ACTION: Broadcast notice to CAD dispatchers
  const handleBroadcastHospitalNotice = (message: string) => {
    const newLog: DispatchLog = {
      id: `hosp-memo-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
      title: 'Hospital Medical Status Update',
      description: message,
      author: currentUser.name
    };

    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === activeIncident.id
          ? {
              ...inc,
              logs: [newLog, ...inc.logs]
            }
          : inc
      )
    );
  };

  // 7. Toggle Congestion on an edge when clicked
  const handleEdgeCongestionChange = (edgeId: string) => {
    sirenAudio.playBeep(700, 80);
    setEdges((prevEdges) =>
      prevEdges.map((e) => {
        if (e.id !== edgeId) return e;

        let nextCongestion: 1.0 | 2.2 | 4.0 | 999.0 = 1.0;
        if (e.congestion === 1.0) nextCongestion = 2.2; // Moderate
        else if (e.congestion === 2.2) nextCongestion = 4.0; // Heavy Jam
        else if (e.congestion === 4.0) nextCongestion = 999.0; // Impassable / Blocked
        else nextCongestion = 1.0; // Clear

        return { ...e, congestion: nextCongestion };
      })
    );
  };

  // 8. Change progress step in CAD pipeline (Manual or Automatic)
  const handleAdvancePipelineStep = (incidentId: string, newStep: number) => {
    sirenAudio.playBeep(880, 100);
    const stepNames = [
      '',
      'Reported',
      'AI Verified',
      'Ambulance En Route',
      'On Scene',
      'Hospital Transit',
      'Resolved'
    ];

    const stepDescriptions: Record<number, string> = {
      1: 'Incident reported and registered in Kerala 108 CAD emergency triage queue.',
      2: 'AI Auto-verified by Gemini CAD. Optimal road corridor and destination hospital confirmed.',
      3: 'Ambulance deployed and actively en route with sirens engaged along shortest Dijkstra corridor.',
      4: 'Paramedics on scene. Initial casualty assessment, bleeding control, and trauma stabilization underway.',
      5: 'Casualty loaded in ambulance. Inbound rapid transit to trauma emergency room active.',
      6: 'Patient safely admitted to hospital emergency ICU bay. Incident cleared; ambulance unit returned to active readiness.'
    };

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;

        const newLog: DispatchLog = {
          id: `log-step-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
          title: `Pipeline: ${stepNames[newStep] || 'Updated'}`,
          description: stepDescriptions[newStep] || `Triage status updated to Step 0${newStep} (${stepNames[newStep]}).`,
          author: 'Kerala 108 CAD Auto-Dispatch'
        };

        return {
          ...inc,
          statusStep: newStep,
          logs: [newLog, ...inc.logs]
        };
      })
    );

    // Fleet state management on pipeline advancement
    if (newStep === 6) {
      setAmbulances((prev) =>
        prev.map((a) =>
          a.assignedIncidentId === incidentId
            ? { ...a, status: 'IDLE', assignedIncidentId: undefined }
            : a
        )
      );
    } else if (newStep === 4) {
      setAmbulances((prev) =>
        prev.map((a) =>
          a.assignedIncidentId === incidentId
            ? { ...a, status: 'ON_SCENE' }
            : a
        )
      );
    } else if (newStep === 5) {
      setAmbulances((prev) =>
        prev.map((a) =>
          a.assignedIncidentId === incidentId
            ? { ...a, status: 'HOSPITAL_TRANSIT' }
            : a
        )
      );
    }
  };

  // Automatic Ambulance Pipeline Updation Loop (every 10 seconds)
  useEffect(() => {
    if (!isAutoPipelineActive) return;

    const timer = setInterval(() => {
      setPipelineCountdown((prev) => {
        if (prev <= 1) {
          // Trigger pipeline advancement on the active in-progress incident
          setIncidents((currIncidents) => {
            let activeInc = currIncidents.find((i) => i.id === activeIncidentId && i.statusStep >= 2 && i.statusStep < 6);
            if (!activeInc) {
              activeInc = currIncidents.find((i) => i.statusStep >= 2 && i.statusStep < 6);
            }

            if (activeInc) {
              const nextStep = activeInc.statusStep + 1;
              setTimeout(() => {
                handleAdvancePipelineStep(activeInc!.id, nextStep);
              }, 0);
            }
            return currIncidents;
          });
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoPipelineActive, activeIncidentId]);

  // 9. Add custom dispatch entry
  const handleAddDispatchLog = (newLogData: Omit<DispatchLog, 'id'>) => {
    sirenAudio.playBeep(920, 120);
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== activeIncident.id) return inc;
        const newEntry: DispatchLog = {
          ...newLogData,
          id: `log-${Date.now()}`
        };
        return {
          ...inc,
          logs: [newEntry, ...inc.logs]
        };
      })
    );
  };

  // 10. Submit new emergency accident report (Auto-verified by Gemini AI in real time)
  const handleSubmitReport = async (newReportData: Partial<IncidentReport>) => {
    sirenAudio.playBeep(1050, 250);

    const incidentNodeId = newReportData.nodeId || 'vytilla_junction';

    // Solve for closest ambulance from fleet and best hospital with available ICU
    const { ambulance: bestAmbulance, route: ambRoute } = findOptimalAmbulanceFromFleet(
      incidentNodeId,
      ambulances,
      nodes,
      edges
    );
    const { hospitalId: bestHospitalId } = findOptimalReceivingHospital(
      incidentNodeId,
      nodes,
      edges
    );

    const newCode = `ACC-2026-EKM${Math.floor(10 + Math.random() * 90)}`;

    // Run AI Auto-Verification
    const aiVerification = await requestAiIncidentVerification({
      title: newReportData.title || `Accident near ${nodes[incidentNodeId]?.shortName || 'Ernakulam'}`,
      locationDetails: newReportData.locationDetails || `${nodes[incidentNodeId]?.name || 'Ernakulam'}, Kerala`,
      severity: newReportData.severity || 'Code Red • Critical',
      casualties: newReportData.casualties || 1,
      vehiclesInvolved: newReportData.vehiclesInvolved || 1,
      sceneDocumentsCount: newReportData.sceneDocuments?.length || 1
    });

    const fullReport: IncidentReport = {
      id: newReportData.id || newCode,
      code: newReportData.code || newCode,
      title: newReportData.title || `Accident near ${nodes[incidentNodeId]?.shortName || 'Ernakulam'}`,
      locationDetails: newReportData.locationDetails || `${nodes[incidentNodeId]?.name || 'Ernakulam'}, Kerala`,
      severity: (aiVerification.severityConfirmed as any) || newReportData.severity || 'Code Red • Critical',
      timestamp: newReportData.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 16),
      nodeId: incidentNodeId,
      assignedAmbulanceId: bestAmbulance.id,
      targetHospitalId: bestHospitalId,
      casualties: newReportData.casualties || 1,
      vehiclesInvolved: newReportData.vehiclesInvolved || 1,
      tags: newReportData.tags || ['Accident Alert', 'AI Auto-Verified'],
      isVerifiedByAdmin: true, // Auto-verified by Gemini AI!
      isVerifiedByAi: true,
      aiVerification,
      statusStep: 3, // Step 3: Ambulance En Route automatically
      sceneDocuments: newReportData.sceneDocuments || [
        {
          id: `doc-${Date.now()}`,
          name: 'accident_scene_cam.jpg',
          size: '1.4 MB',
          type: 'image',
          url: '/src/assets/images/accident_scene_overview_1792007786071.jpg'
        }
      ],
      logs: [
        {
          id: `rep-ai-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
          title: 'Accident Auto-Verified by Gemini AI CAD Engine',
          description: `AI triage verification succeeded with ${aiVerification.confidenceScore}% confidence. Dijkstra solver dynamically assigned closest fleet unit ${bestAmbulance.name} (ETA ~${ambRoute.estimatedMinutes}m) and routed to ${nodes[bestHospitalId]?.name.split(',')[0]} (${nodes[bestHospitalId]?.icuAvailable} ICU beds available).`,
          author: 'ResQPath AI Triage (Gemini 3.8 Flash)'
        },
        {
          id: `rep-cit-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
          title: 'Accident Reported to Kerala 108 CAD',
          description: `Citizen emergency call received from ${currentUser.name}. Automated AI triage activated immediately.`,
          author: currentUser.name
        }
      ]
    };

    setIncidents((prev) => [fullReport, ...prev]);
    setActiveIncidentId(fullReport.id);

    // Update fleet status: Mark closest ambulance as Active En Route
    setAmbulances((prev) =>
      prev.map((a) =>
        a.id === bestAmbulance.id
          ? {
              ...a,
              status: 'ACTIVE_EN_ROUTE',
              assignedIncidentId: fullReport.id
            }
          : a
      )
    );

    // Create Admin Notification
    const newNotif: AdminNotification = {
      id: `notif-${Date.now()}`,
      incidentId: fullReport.id,
      incidentCode: fullReport.code,
      title: fullReport.title,
      location: fullReport.locationDetails,
      severity: fullReport.severity,
      confidence: aiVerification.confidenceScore,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
      isRead: false,
      ambulanceName: bestAmbulance.name,
      hospitalName: nodes[bestHospitalId]?.name.split(',')[0],
      routeEtaMinutes: ambRoute.estimatedMinutes
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);
    sirenAudio.playBeep(1200, 300);
  };

  // Reset simulation to factory default
  const handleResetSimulation = () => {
    sirenAudio.playBeep(600, 100);
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setAmbulances(INITIAL_AMBULANCES);
    setIncidents(INITIAL_INCIDENTS);
    setActiveIncidentId('ACC-2026-EKM01');
  };

  // Open photo lightbox
  const handleOpenPhotoPreview = (docUrl: string, title: string) => {
    setLightboxData({
      isOpen: true,
      url: docUrl,
      title
    });
  };

  // IF NOT AUTHENTICATED: Display Role Selection / Sign In Screen FIRST!
  if (!isAuthenticated) {
    return (
      <RoleSelectScreen
        nodes={nodes}
        onSelectRoleAndLogin={handleSelectRoleAndLogin}
      />
    );
  }

  // IF AUTHENTICATED: Display the chosen module within the ResQPath layout
  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#070b15] text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-200`}>
      {/* Top Header with ResQPath Branding, Role Switcher & Sign Out to Role Screen */}
      <Header
        userRole={currentUser.role}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenResearchModal={() => setIsResearchModalOpen(true)}
        onResetSimulation={handleResetSimulation}
        onExitToRoleSelect={() => setIsAuthenticated(false)}
        activeDispatchesCount={incidents.filter((i) => i.statusStep >= 2 && i.statusStep <= 5).length}
        pendingTriageCount={incidents.filter((i) => !i.isVerifiedByAdmin || i.statusStep === 1).length}
        notifications={notifications}
        onViewOnMap={handleViewOnMap}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onOpenChatbot={() => setIsChatbotOpen(true)}
      />

      {/* Main Module Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* MODULE 1: CITIZEN PORTAL */}
        {currentUser.role === 'citizen' && (
          <CitizenModule
            incidents={incidents}
            activeIncident={activeIncident}
            nodes={nodes}
            ambulances={ambulances}
            onSelectIncident={setActiveIncidentId}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onDial108={() => setIsDialModalOpen(true)}
            onOpenPhotoPreview={handleOpenPhotoPreview}
            estimatedArrivalMinutes={liveRouteMetrics.ambulanceMinutes}
            transitHospitalKm={liveRouteMetrics.hospitalKm}
          />
        )}

        {/* MODULE 2: HOSPITAL PORTAL (Strictly NO OSM Map - Capacity & Availability only) */}
        {currentUser.role === 'hospital' && (
          <HospitalModule
            hospitalId={managedHospitalId}
            nodes={nodes}
            incidents={incidents}
            ambulances={ambulances}
            onUpdateHospitalCapacity={handleUpdateHospitalCapacity}
            onBroadcastHospitalNotice={handleBroadcastHospitalNotice}
            onOpenPhotoPreview={handleOpenPhotoPreview}
            onSelectHospitalId={(id) => {
              setManagedHospitalId(id);
              setCurrentUser((prev) => ({
                ...prev,
                hospitalId: id,
                badge: `Trauma Medical Officer · ${nodes[id]?.name.split(',')[0] || 'Hospital'}`
              }));
            }}
          />
        )}

        {/* MODULE 3: CENTRAL CAD ADMIN PORTAL (Verification + Dijkstra + Fleet + Hospitals + Weighted Graph & OSM) */}
        {currentUser.role === 'admin' && (
          <AdminModule
            incidents={incidents}
            activeIncident={activeIncident}
            nodes={nodes}
            edges={edges}
            ambulances={ambulances}
            onSelectIncident={setActiveIncidentId}
            onVerifyAndSolveDijkstra={handleVerifyAndSolveDijkstra}
            onAdvancePipelineStep={handleAdvancePipelineStep}
            isAutoPipelineActive={isAutoPipelineActive}
            onToggleAutoPipeline={() => setIsAutoPipelineActive((prev) => !prev)}
            pipelineCountdown={pipelineCountdown}
            onAssignAmbulance={handleAssignAmbulance}
            onRelocateAmbulance={handleRelocateAmbulance}
            onToggleHospitalStatus={handleToggleHospitalStatus}
            onToggleAmbulanceStatus={handleToggleAmbulanceStatus}
            onEdgeCongestionChange={handleEdgeCongestionChange}
            onAddDispatchLog={handleAddDispatchLog}
            onOpenPhotoPreview={handleOpenPhotoPreview}
          />
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t ${isDark ? 'border-slate-800/80 bg-[#060b14] text-slate-500' : 'border-slate-200 bg-white text-slate-600 shadow-inner'} py-6 text-xs transition-colors duration-200`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>ResQPath</span>
            <span>·</span>
            <span>Intelligent Emergency Ambulance Routing and Dispatch System</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Faster Routes. Smarter Response. Saving Lives.</span>
            <span>·</span>
            <span className="font-mono text-cyan-400">Kerala 108 EMS CAD · Ernakulam</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        nodes={nodes}
        onLoginSuccess={(profile) => {
          handleSelectRoleAndLogin(profile);
          setIsLoginModalOpen(false);
        }}
      />

      <ReportAccidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        nodes={nodes}
        onSubmitReport={handleSubmitReport}
      />

      <ResearchModal
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
      />

      <Dial911Modal
        isOpen={isDialModalOpen}
        onClose={() => setIsDialModalOpen(false)}
      />

      <PhotoLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={lightboxData.url}
        imageTitle={lightboxData.title}
      />

      {/* Live Emergency AI Auto-Verification Toast Alert with View on Map */}
      <EmergencyToast
        notification={activeToast}
        onDismiss={() => setActiveToast(null)}
        onViewOnMap={handleViewOnMap}
      />

      {/* Floating Action Launcher for Gemini AI Assistant */}
      {!isChatbotOpen && (
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-950/40 border border-cyan-400/50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Open Gemini EMS CAD AI Assistant"
        >
          <Sparkles className="w-4 h-4 text-cyan-200 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Gemini AI Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* Multi-turn Gemini AI Chatbot Modal */}
      <GeminiChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        initialRole={
          currentUser.role === 'citizen'
            ? 'first_aid'
            : currentUser.role === 'hospital'
            ? 'hospital_liaison'
            : 'cad_dispatcher'
        }
      />
    </div>
  );
}
