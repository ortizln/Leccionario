class AuthSession {
  const AuthSession({
    required this.token,
    required this.username,
    required this.fullName,
    required this.primaryRole,
    this.isOfflineLocalAdmin = false,
  });

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    return AuthSession(
      token: json['token'] as String,
      username: json['username'] as String,
      fullName: json['fullName'] as String,
      primaryRole: json['primaryRole'] as String,
      isOfflineLocalAdmin: json['isOfflineLocalAdmin'] as bool? ?? false,
    );
  }

  final String token;
  final String username;
  final String fullName;
  final String primaryRole;
  final bool isOfflineLocalAdmin;

  Map<String, dynamic> toJson() => {
        'token': token,
        'username': username,
        'fullName': fullName,
        'primaryRole': primaryRole,
        'isOfflineLocalAdmin': isOfflineLocalAdmin,
      };
}
