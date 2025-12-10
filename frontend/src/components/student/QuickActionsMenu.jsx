import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import {
    Assignment,
    Schedule,
    Forum,
    Analytics,
    MenuBook,
    PlaylistAddCheck
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActionsMenu = () => {
    const navigate = useNavigate();

    const actions = [
        { icon: <PlaylistAddCheck />, name: 'To-Do List', path: '/student/todos' },
        { icon: <MenuBook />, name: 'Browse Courses', path: '/student/courses' },
        { icon: <Analytics />, name: 'Performance', path: '/student/performance' },
        // { icon: <Forum />, name: 'Doubts', path: '/student/doubts' }, 
        { icon: <Schedule />, name: 'Exams & Schedule', path: '/student/tests' },
        { icon: <Assignment />, name: 'Assignments', path: '/student/assignments' },
    ];

    return (
        <SpeedDial
            ariaLabel="Quick actions"
            sx={{ position: 'fixed', bottom: 32, right: 32 }}
            icon={<SpeedDialIcon />}
        >
            {actions.map((action) => (
                <SpeedDialAction
                    key={action.name}
                    icon={action.icon}
                    tooltipTitle={action.name}
                    onClick={() => navigate(action.path)}
                />
            ))}
        </SpeedDial>
    );
};

export default QuickActionsMenu;
