import React, { useState } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

export const FirebaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Testando conexão...');

    try {
      if (!user) {
        setTestResult('❌ Usuário não autenticado');
        return;
      }

      // Teste 1: Escrever dados simples
      const testRef = ref(database, `test/${user.uid}`);
      const testData = {
        timestamp: Date.now(),
        message: 'Teste de conexão Firebase'
      };

      console.log('📝 Escrevendo dados de teste...');
      await set(testRef, testData);
      console.log('✅ Dados de teste escritos com sucesso');

      // Teste 2: Ler os dados de volta
      console.log('📖 Lendo dados de teste...');
      const snapshot = await get(testRef);
      
      if (snapshot.exists()) {
        console.log('✅ Dados lidos com sucesso:', snapshot.val());
        setTestResult('✅ Conexão Firebase funcionando!');
      } else {
        setTestResult('❌ Dados não encontrados');
      }

      // Teste 3: Testar o caminho das contas
      const accountsRef = ref(database, `users/${user.uid}/accounts`);
      const accountsTestData = [{ test: true, timestamp: Date.now() }];
      
      console.log('📝 Testando caminho das contas...');
      await set(accountsRef, accountsTestData);
      console.log('✅ Dados das contas escritos com sucesso');
      
      const accountsSnapshot = await get(accountsRef);
      if (accountsSnapshot.exists()) {
        console.log('✅ Dados das contas lidos com sucesso:', accountsSnapshot.val());
        setTestResult('✅ Conexão e caminho das contas funcionando!');
      }

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setTestResult(`❌ Erro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed bottom-4 left-4 bg-yellow-600 text-white p-4 rounded">
        <p>Faça login para testar o Firebase</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded max-w-sm">
      <h3 className="font-bold mb-2">Teste Firebase</h3>
      <p className="text-sm mb-2">UID: {user.uid}</p>
      <button
        onClick={testFirebaseConnection}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm disabled:opacity-50"
      >
        {isLoading ? 'Testando...' : 'Testar Conexão'}
      </button>
      {testResult && (
        <p className="mt-2 text-sm">{testResult}</p>
      )}
    </div>
  );
};
