const JobNotificationServices = require('../../services/jobNotificationServices');
const {UsersModel} = require('../../models');
const NotificationsServices = require('../../services/notificationsServices');
const {
  roles,
  driverStatuses,
  vehicleTypes,
} = require('../../constants/usersConstants');

// Mock de los modelos y servicios
jest.mock('../../models');
jest.mock('../../services/notificationsServices');

describe('JobNotificationServices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('notifyDriversAboutNewJob', () => {
    it('debe notificar a conductores elegibles cuando se crea un trabajo', async () => {
      // Arrange
      const mockJob = {
        _id: 'job123',
        title: 'Conductor de Quinta Rueda',
        vehicleType: vehicleTypes.fifthWheeler.value,
        federalLicenseTypes: ['A', 'B'],
        stateLicenseTypes: ['A'],
        handledEquipment: ['dryBox', 'refrigerated'],
        experience: ['intermediate', 'advance'],
        city: 'Monterrey',
        postalCode: '64000',
        companyId: 'company123',
      };

      const mockDrivers = [
        {_id: 'driver1'},
        {_id: 'driver2'},
        {_id: 'driver3'},
      ];

      UsersModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDrivers),
      });

      NotificationsServices.createNotification = jest
        .fn()
        .mockResolvedValue({success: true});

      // Act
      const result = await JobNotificationServices.notifyDriversAboutNewJob({
        job: mockJob,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.notifiedCount).toBe(3);
      expect(result.totalEligible).toBe(3);
      expect(NotificationsServices.createNotification).toHaveBeenCalledTimes(3);
    });

    it('debe filtrar solo conductores verificados y disponibles', async () => {
      // Arrange
      const mockJob = {
        _id: 'job123',
        vehicleType: vehicleTypes.fifthWheeler.value,
        federalLicenseTypes: ['A'],
        companyId: 'company123',
      };

      UsersModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      // Act
      await JobNotificationServices.notifyDriversAboutNewJob({job: mockJob});

      // Assert
      expect(UsersModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          role: roles.driver.value,
          isVerified: true,
          driverStatus: {
            $in: [
              driverStatuses.available.value,
              driverStatuses.availableSoon.value,
            ],
          },
        })
      );
    });

    it('debe incluir filtro de licencias en la query', async () => {
      // Arrange
      const mockJob = {
        _id: 'job123',
        vehicleType: vehicleTypes.fifthWheeler.value,
        federalLicenseTypes: ['A', 'B'],
        stateLicenseTypes: ['C'],
        companyId: 'company123',
      };

      UsersModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue([]),
      });

      // Act
      await JobNotificationServices.notifyDriversAboutNewJob({job: mockJob});

      // Assert
      const callArgs = UsersModel.find.mock.calls[0][0];
      expect(callArgs.$and).toBeDefined();
      expect(callArgs.$and[0].$or).toBeDefined();
      expect(callArgs.$and[0].$or).toHaveLength(2); // federal y state
    });

    it('debe manejar errores correctamente', async () => {
      // Arrange
      const mockJob = {
        _id: 'job123',
        vehicleType: vehicleTypes.fifthWheeler.value,
        companyId: 'company123',
      };

      UsersModel.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      // Act
      const result = await JobNotificationServices.notifyDriversAboutNewJob({
        job: mockJob,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getEligibleDriversCount', () => {
    it('debe retornar el conteo de conductores elegibles', async () => {
      // Arrange
      const mockJobData = {
        vehicleType: vehicleTypes.fifthWheeler.value,
        federalLicenseTypes: ['A'],
        city: 'Monterrey',
      };

      UsersModel.countDocuments = jest.fn().mockResolvedValue(10);

      // Act
      const result = await JobNotificationServices.getEligibleDriversCount({
        jobData: mockJobData,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.eligibleCount).toBe(10);
      expect(UsersModel.countDocuments).toHaveBeenCalledTimes(1);
    });

    it('debe aplicar los mismos filtros que notifyDriversAboutNewJob', async () => {
      // Arrange
      const mockJobData = {
        vehicleType: vehicleTypes.fifthWheeler.value,
        federalLicenseTypes: ['A', 'B'],
        stateLicenseTypes: ['C'],
        handledEquipment: ['dryBox'],
        experience: ['intermediate'],
        city: 'Monterrey',
      };

      UsersModel.countDocuments = jest.fn().mockResolvedValue(5);

      // Act
      await JobNotificationServices.getEligibleDriversCount({
        jobData: mockJobData,
      });

      // Assert
      const callArgs = UsersModel.countDocuments.mock.calls[0][0];
      expect(callArgs.role).toBe(roles.driver.value);
      expect(callArgs.isVerified).toBe(true);
      expect(callArgs.vehicleType).toBe(vehicleTypes.fifthWheeler.value);
      expect(callArgs.handleEquipment).toEqual({$in: ['dryBox']});
      expect(callArgs.experience).toEqual({$in: ['intermediate']});
      expect(callArgs.city).toBe('Monterrey');
    });

    it('debe manejar errores correctamente', async () => {
      // Arrange
      const mockJobData = {
        vehicleType: vehicleTypes.fifthWheeler.value,
      };

      UsersModel.countDocuments = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      // Act
      const result = await JobNotificationServices.getEligibleDriversCount({
        jobData: mockJobData,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
