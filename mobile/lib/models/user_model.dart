class UserModel {
  final String id;
  final String email;
  final String? firstName;
  final String? lastName;
  final String? username;
  final String? mobileNo;
  final String? photo;
  final String? gender;
  final String? token;
  final bool filledBasicInfo;

  UserModel({
    required this.id,
    required this.email,
    this.firstName,
    this.lastName,
    this.username,
    this.mobileNo,
    this.photo,
    this.gender,
    this.token,
    this.filledBasicInfo = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, {String? token}) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      email: json['email'] ?? '',
      firstName: json['firstName'] ?? json['name']?.toString().split(' ').first,
      lastName: json['lastName'] ?? (json['name']?.toString().contains(' ') == true ? json['name'].toString().split(' ').sublist(1).join(' ') : null),
      username: json['username'],
      mobileNo: json['mobileNo'] ?? json['phone'],
      photo: json['photo'],
      gender: json['gender'],
      token: token ?? json['token'] ?? json['userToken'],
      filledBasicInfo: json['filledBasicInfo'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'username': username,
      'mobileNo': mobileNo,
      'photo': photo,
      'gender': gender,
      'token': token,
      'filledBasicInfo': filledBasicInfo,
    };
  }

  String get displayName {
    if (firstName != null && firstName!.isNotEmpty) {
      return '$firstName ${lastName ?? ""}'.trim();
    }
    return email.split('@').first;
  }
}
