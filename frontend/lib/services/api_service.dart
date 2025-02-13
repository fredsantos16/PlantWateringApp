import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants.dart'; // Import your constants file

class ApiService {
  // Example: Fetch all plants
  Future<List<dynamic>> fetchPlants() async {
    final response = await http.get(Uri.parse("$API_URL/plants"));

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      throw Exception("Failed to load plants");
    }
  }
}
