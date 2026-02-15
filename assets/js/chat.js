/**
 * IDLPMS - HUD Chat Engine
 * Implements strict role-based hierarchy for communications.
 */

window.ChatEngine = {
    init() {
        console.log("Chat Engine Initializing...");
        if (typeof IDLPMS_DATA === 'undefined') {
            console.error("ChatEngine: IDLPMS_DATA not found. Retrying in 100ms...");
            setTimeout(() => this.init(), 100);
            return;
        }
        this.renderChatList();
    },

    getParticipants() {
        const currentUser = getCurrentUser();
        if (!currentUser) return {};

        const currentId = currentUser.id;
        const currentData = IDLPMS_DATA.users[currentId];
        if (!currentData) return {};

        const participants = Object.entries(IDLPMS_DATA.users)
            .filter(([id, user]) => {
                if (id === currentId) return false;

                const role = currentUser.role;
                const targetRole = user.role;

                // Hierarchical filtering rules...
                if (role === 'STUDENT') {
                    if (currentData.studentType === 'SYSTEM' && targetRole === 'STUDENT' &&
                        user.schoolId === currentData.schoolId && user.classId === currentData.classId) return true;
                    if (currentData.studentType === 'HOMESCHOOL') {
                        if (targetRole === 'PARENT' && id === currentData.parentId) return true;
                    } else {
                        if (targetRole === 'TEACHER' && user.schoolId === currentData.schoolId) return true;
                    }
                    return false;
                }

                if (role === 'PARENT') {
                    const myChild = IDLPMS_DATA.users[currentData.studentId];
                    if (!myChild) return false;

                    if (targetRole === 'STUDENT' && id === currentData.studentId) return true;
                    // Peers: Other parents in the same school/class
                    if (targetRole === 'PARENT') {
                        const targetChild = IDLPMS_DATA.users[user.studentId];
                        if (targetChild && targetChild.schoolId === myChild.schoolId && targetChild.classId === myChild.classId) return true;
                    }
                    // Superior: child's CLASS TEACHER
                    if (targetRole === 'TEACHER' && user.schoolId === myChild.schoolId &&
                        user.teacherType === 'CLASS_TEACHER' && user.responsibilities?.classTeacherOf === myChild.classId) return true;
                    return false;
                }

                if (role === 'TEACHER') {
                    if (targetRole === 'STUDENT' && user.schoolId === currentData.schoolId) return true;
                    if (targetRole === 'TEACHER' && user.schoolId === currentData.schoolId) return true;
                    // Superior: ONLY ONE School Director
                    if (targetRole === 'SCHOOL_DIR' && user.schoolId === currentData.schoolId && id === 'SCH_DIR_001') return true;
                    return false;
                }

                if (role === 'SCHOOL_DIR') {
                    const mySchool = IDLPMS_DATA.structure.schools[currentData.schoolId];
                    const myDistrictId = mySchool ? mySchool.districtId : currentData.districtId;

                    if (targetRole === 'TEACHER' && user.schoolId === currentData.schoolId) return true;
                    // Superior: ONLY the head of their specific district
                    if (targetRole === 'ESA_DIR' && user.districtId === myDistrictId && id.includes('_DIR_001')) return true;
                    if (targetRole === 'SCHOOL_DIR') {
                        const targetSchool = IDLPMS_DATA.structure.schools[user.schoolId];
                        const targetDistrictId = targetSchool ? targetSchool.districtId : user.districtId;
                        if (targetDistrictId === myDistrictId) return true;
                    }
                    return false;
                }

                if (role === 'ESA_DIR') {
                    const myDistrictId = currentData.districtId;
                    if (targetRole === 'SCHOOL_DIR') {
                        const targetSchool = IDLPMS_DATA.structure.schools[user.schoolId];
                        const targetDistrictId = targetSchool ? targetSchool.districtId : user.districtId;
                        if (targetDistrictId === myDistrictId) return true;
                    }
                    if (targetRole === 'ESA_DIR') return true;
                    // Superior: ONLY the Secretary General
                    if (targetRole === 'OBEC' && id === 'OBEC_001') return true;
                    return false;
                }

                if (role === 'OBEC') {
                    if (targetRole === 'ESA_DIR' && id.endsWith('_001')) return true;
                    if (targetRole === 'OBEC') return true;
                    // Superior: ONLY the Minister
                    if (targetRole === 'MOE' && id === 'MOE_001') return true;
                    return false;
                }

                return false;
            })
            .map(([id, user]) => {
                const roleCfg = IDLPMS_DATA.roles[user.role];
                const role = currentUser.role;
                let displayOrg = '';
                if (user.schoolId) displayOrg = IDLPMS_DATA.structure.schools[user.schoolId]?.name;
                else if (user.districtId) displayOrg = IDLPMS_DATA.structure.districts[user.districtId]?.name;
                else displayOrg = user.org;

                // --- Intelligent Hierarchy Linking (Direct Supervisor Detection) ---
                let isDirectLink = false;

                if (role === 'STUDENT') {
                    isDirectLink = (user.role === 'TEACHER' && user.teacherType === 'CLASS_TEACHER' &&
                        user.schoolId === currentData.schoolId && user.responsibilities?.classTeacherOf === currentData.classId);
                } else if (role === 'PARENT') {
                    const myChild = IDLPMS_DATA.users[currentData.studentId];
                    if (myChild) {
                        isDirectLink = (user.role === 'TEACHER' && user.teacherType === 'CLASS_TEACHER' &&
                            user.schoolId === myChild.schoolId && user.responsibilities?.classTeacherOf === myChild.classId);
                    }
                } else if (role === 'TEACHER') {
                    isDirectLink = (user.role === 'SCHOOL_DIR' && user.schoolId === currentData.schoolId);
                } else if (role === 'SCHOOL_DIR') {
                    // Find out which district the school belongs to
                    const school = IDLPMS_DATA.structure.schools[currentData.schoolId];
                    const myDistrictId = school ? school.districtId : currentData.districtId;
                    isDirectLink = (user.role === 'ESA_DIR' && (user.districtId === myDistrictId || id === 'ESA_DIR_001'));
                } else if (role === 'ESA_DIR') {
                    isDirectLink = (user.role === 'OBEC');
                } else if (role === 'OBEC') {
                    isDirectLink = (user.role === 'MOE');
                }

                return { ...roleCfg, ...user, id, org: displayOrg || 'IDLPMS', isDirectLink };
            });

        const ROLE_RANK = { 'MOE': 7, 'OBEC': 6, 'ESA_DIR': 5, 'SCHOOL_DIR': 4, 'TEACHER': 3, 'PARENT': 2, 'STUDENT': 1 };
        const userRank = ROLE_RANK[currentUser.role] || 0;

        const groups = {
            'BROADCAST CHANNELS': [],
            'COMMAND CHANNELS': [],
            'COMMAND AUTHORITY': [],
            'PEER PERSONNEL': [],
            'DIRECT REPORTS': []
        };

        // --- Dynamic Broadcast Generation (Superior to All Subordinates) ---
        const myRole = currentUser.role;
        if (myRole === 'MOE' || myRole === 'OBEC') {
            groups['BROADCAST CHANNELS'].push({
                id: 'BR_NATIONAL',
                name: 'Announcement: National Regional Directors',
                type: 'BROADCAST',
                isGroup: true,
                avatar: 'NB',
                color: 'id-moe'
            });
        } else if (myRole === 'ESA_DIR') {
            const district = IDLPMS_DATA.structure.districts[currentData.districtId];
            groups['BROADCAST CHANNELS'].push({
                id: `BR_DISTRICT_${currentData.districtId}`,
                name: `Announcement: District School Directors (${district?.name || 'ESA'})`,
                type: 'BROADCAST',
                isGroup: true,
                avatar: 'DB',
                color: 'id-esa'
            });
        } else if (myRole === 'SCHOOL_DIR') {
            const school = IDLPMS_DATA.structure.schools[currentData.schoolId];
            groups['BROADCAST CHANNELS'].push({
                id: `BR_SCHOOL_${currentData.schoolId}`,
                name: `Announcement: Faculty (${school?.name || 'IDLPMS'})`,
                type: 'BROADCAST',
                isGroup: true,
                avatar: 'SB',
                color: 'id-dir'
            });
        } else if (myRole === 'TEACHER') {
            if (currentData.teacherType === 'CLASS_TEACHER') {
                groups['BROADCAST CHANNELS'].push({
                    id: `BR_CLASS_${currentData.responsibilities?.classTeacherOf}`,
                    name: `Announcement: Class ${currentData.responsibilities?.classTeacherOf} Students`,
                    type: 'BROADCAST',
                    isGroup: true,
                    avatar: 'CB',
                    color: 'sj-thai'
                });
            }
        }

        // --- Add Static Group Channels (Based on Role Access) ---
        Object.entries(IDLPMS_DATA.groups || {}).forEach(([gid, gdata]) => {
            const isMember = gdata.members.includes(currentId);
            if (isMember) {
                groups['COMMAND CHANNELS'].push({
                    ...gdata,
                    isGroup: true
                });
            }
        });

        participants.forEach(p => {
            const pRank = ROLE_RANK[p.role] || 0;
            if (pRank > userRank) groups['COMMAND AUTHORITY'].push(p);
            else if (pRank === userRank) groups['PEER PERSONNEL'].push(p);
            else groups['DIRECT REPORTS'].push(p);
        });

        // --- Prioritize Direct Supervisors (Sort isDirectLink to top) ---
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => {
                if (a.isDirectLink && !b.isDirectLink) return -1;
                if (!a.isDirectLink && b.isDirectLink) return 1;
                return 0;
            });
        });

        return groups;
    },

    toggleGroup(groupId) {
        const body = document.getElementById(`group-body-${groupId}`);
        const icon = document.getElementById(`group-icon-${groupId}`);
        if (body && icon) {
            const isHidden = body.classList.contains('hidden');
            body.classList.toggle('hidden');
            icon.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
        }
    },

    renderChatList() {
        const chatList = document.getElementById('chatList');
        if (!chatList) return;

        const groups = this.getParticipants();
        let html = '';

        Object.entries(groups).forEach(([groupName, members]) => {
            if (members.length === 0) return;

            html += `
                <div class="mb-2">
                    <div onclick="window.ChatEngine.toggleGroup('${groupName}')" 
                         class="flex items-center justify-between px-3 py-2 text-sm uppercase font-extralight text-[var(--vs-text-muted)] hover:text-[var(--vs-text-title)] cursor-pointer group/group-header transition-colors">
                        <div class="flex items-center space-x-2">
                            <i id="group-icon-${groupName}" class="icon i-chevron-right h-3 w-3 transition-transform rotate-90 opacity-50"></i>
                            <span class="font-extralight">${groupName}</span>
                        </div>
                        <span class="bg-[var(--vs-bg-deep)] px-1.5 py-0.5 rounded-[2px] text-sm font-extralight border border-[rgba(var(--vs-border-rgb),0.3)]">${window.formatNumberStandard(members.length)}</span>
                    </div>
                    <div id="group-body-${groupName}" class="space-y-0.5 mt-0.5">
                        ${members.map(p => {
                const statusColor = {
                    'ONLINE': 'bg-emerald-500',
                    'BUSY': 'bg-rose-500',
                    'AWAY': 'bg-amber-500',
                    'OFFLINE': 'bg-zinc-600'
                }[p.status || 'ONLINE'];

                return `
                            <div data-user-id="${p.id}" onclick="window.ChatEngine.openChat('${p.id}', ${p.isGroup ? 'true' : 'false'})" 
                                 class="chat-contact-item vs-menu-item flex items-center space-x-3 p-2.5 mx-1 rounded-[3px] cursor-pointer group transition-all">
                                <div class="w-8 h-8 shrink-0 aspect-square rounded-[3px] flex items-center justify-center text-[11px] font-extralight transition-all"
                                     style="background: rgba(var(--${p.color || 'id-def'}-rgb), 0.08); border: 1px solid rgba(var(--${p.color || 'id-def'}-rgb), 0.25); color: rgb(var(--${p.color || 'id-def'}-rgb));">
                                    ${p.avatar}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="text-[var(--vs-text-title)] text-sm font-extralight Thai-Rule truncate transition-colors">${p.fullName || p.name}</div>
                                    <div class="text-sm uppercase text-[var(--vs-text-muted)] truncate font-extralight flex items-center space-x-2">
                                        <span>${p.isGroup ? p.type : (p.subject ? p.subject : (p.name || p.role))}</span>
                                        ${p.isDirectLink ? `<span class="px-1.5 py-0.5 border border-white/20 bg-white/5 text-[var(--vs-accent)] text-[9px] rounded-[var(--vs-radius)] font-extralight">DIRECT_SUPERVISOR</span>` : ''}
                                    </div>
                                </div>
                                <div class="flex flex-col items-center space-y-1">
                                    <div class="w-1.5 h-1.5 shrink-0 rounded-[3px] ${statusColor} ${p.status === 'ONLINE' ? 'vs-status-pulse' : ''}"></div>
                                    <span class="text-sm text-[var(--vs-text-muted)] font-extralight">${p.isGroup ? 'CH' : window.formatNumberStandard(1) + 'm'}</span>
                                </div>
                            </div>
                        `;
            }).join('')}
                    </div>
                </div>
            `;
        });

        chatList.innerHTML = html || `<div class="p-6 text-[var(--vs-text-muted)] text-sm uppercase text-center mt-4 font-extralight">No active contacts available.</div>`;
    },

    openChat(userId, isGroup = false) {
        const mainFrame = document.getElementById('main-frame');
        const breadcrumbPage = document.getElementById('header-page-name');
        if (!mainFrame) return;

        // UI Highlighting for sidebar contact
        const contactItems = document.querySelectorAll('#chatList .chat-contact-item');
        contactItems.forEach(item => {
            const itemUserId = item.getAttribute('data-user-id');
            const isTarget = userId && (itemUserId === userId);
            if (isTarget) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        if (!userId) {
            // Welcome Page
            mainFrame.src = 'pages/chat.html';
            if (breadcrumbPage) breadcrumbPage.innerText = 'Communications: Direct Messages';
            return;
        }

        console.log(`ChatEngine: Navigating to ${isGroup ? 'Group' : 'Direct'} Channel for`, userId);
        mainFrame.src = `pages/chat.html?userId=${userId}${isGroup ? '&isGroup=true' : ''}`;

        if (breadcrumbPage) {
            let target = isGroup ? IDLPMS_DATA.groups[userId] : IDLPMS_DATA.users[userId];

            // Handle Virtual Broadcast Channels
            if (isGroup && !target && userId.startsWith('BR_')) {
                const broadcastGroups = this.getParticipants()['BROADCAST CHANNELS'];
                target = broadcastGroups.find(g => g.id === userId);
            }

            if (target) {
                breadcrumbPage.innerText = `Chat: ${target.fullName || target.name}`;
            }
        }
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => window.ChatEngine.init());
