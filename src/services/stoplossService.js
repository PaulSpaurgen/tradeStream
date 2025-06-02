import axios from 'axios';

const BASE_URL = 'https://us-central1-tradestream-cloud.cloudfunctions.net';

export const stoplossService = {
    async getStoplossData(params = { uid: 'test_data', session_id: 'session12394' }) {
        try {
            const response = await axios.get(`${BASE_URL}/stoploss-optimizooor`, {
                params
            });

            if (response && response.data) {
                // Replace NaN values with null in the response
                const safeJson = response.data.replace(/\bNaN\b/g, 'null');
                const parsed = JSON.parse(safeJson);

                // Process trades data
                const data = (parsed?.data || [])

                return {
                    success: true,
                    data: data
                };
            }

            return {
                success: false,
                error: 'Invalid response format'
            };

        } catch (error) {
            console.error('Error fetching stoploss data:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch stoploss data'
            };
        }
    }
}; 