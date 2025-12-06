import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import {
    Assignment,
    Schedule,
    Forum,
    Analytics,
    MenuBook
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActionsMenu = () => {
    const navigate = useNavigate();

    const actions = [
        { icon: <MenuBook />, name: 'Browse Courses', path: '/student/courses' },
        { icon: <Analytics />, name: 'Performance', path: '/student/performance' }, // TODO: Create page
        { icon: <Forum />, name: 'Doubts', path: '/student/doubts' }, // TODO: Create page
        { icon: <Schedule />, name: 'Schedule', path: '/student/schedule' }, // TODO: Create page
        { icon: <Assignment />, name: 'Assignments', path: '/student/assignments' }, // TODO: Create page
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
