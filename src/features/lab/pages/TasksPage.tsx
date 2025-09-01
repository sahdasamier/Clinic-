import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Checkbox, 
  Container, 
  FormControlLabel, 
  Typography 
} from '@mui/material';
import { tasksStore } from '../tasksStore';
import { TaskItem } from '../types';

const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    setTasks(tasksStore.getTasks());
  }, []);

  const handleTaskToggle = (taskId: string, checked: boolean) => {
    tasksStore.updateTask(taskId, checked);
    setTasks(tasksStore.getTasks());
  };

  const handleReset = () => {
    tasksStore.resetTasks();
    setTasks(tasksStore.getTasks());
  };

  const completedCount = tasks.filter(task => task.done).length;
  const totalCount = tasks.length;

  return (
    <Container maxWidth="lg" className="py-8">
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" gutterBottom>
              {t('implementation_tasks')}
            </Typography>
            <Typography variant="h6">
              {completedCount}/{totalCount} {t('completed')}
            </Typography>
          </Box>
          
          <Box mb={2}>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleReset}
            >
              {t('reset_tasks')}
            </Button>
          </Box>
          
          <Box>
            {tasks.map((task) => (
              <Box 
                key={task.id} 
                display="flex" 
                alignItems="center" 
                py={1}
                borderBottom={1} 
                borderColor="divider"
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={task.done}
                      onChange={(e) => handleTaskToggle(task.id, e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography 
                      variant="body1" 
                      style={{ 
                        textDecoration: task.done ? 'line-through' : 'none',
                        color: task.done ? 'textSecondary' : 'inherit'
                      }}
                    >
                      {task.text}
                    </Typography>
                  }
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default TasksPage;