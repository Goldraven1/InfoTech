import unittest
import sys
import os

# Добавляем путь к папке run_server в sys.path для импорта модулей
sys.path.append(os.path.join(os.path.dirname(__file__), '../run_server'))

# Здесь будут тесты для приложения
class TestApp(unittest.TestCase):
    def test_connection(self):
        # Заглушка для теста
        self.assertTrue(True)
        
    def test_data_retrieval(self):
        # Заглушка для теста
        self.assertTrue(True)
        
if __name__ == '__main__':
    unittest.main()
